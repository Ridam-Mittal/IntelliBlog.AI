import { Router } from "express";
import { Category } from './../models/Category.model.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/User.model.js";

const router = Router();

router.post('/create-category', verifyJWT, async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.user._id);

        // Check if the user is an admin
        if (user.role !== 1) {
            return res.status(403).send("User not authorized to create category");
        }

        if (!name) {
            return res.status(400).send("Category name is required");
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(409).send("Category already exists");
        }

        // Create the category
        await Category.create({ name });

        return res.status(200).send("Category added successfully");
    } catch (error) {
        console.error("error:", error);
        return res.status(500).send(`Internal server error, ${error}`);
    }
});



router.get('/', async (req, res) => {
    try {
      const categories = await Category.find().select('_id name');
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).send("Internal Server Error");
    }
  });


export default router;
