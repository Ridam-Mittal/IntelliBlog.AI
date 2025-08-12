import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useRef, useEffect } from 'react';

export default function RTE({ value, onChange,  isTyping }) {
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current) {
        const editor = editorRef.current.editor;
        if (editor) {
            editor.setMode(isTyping ? 'readonly' : 'design');
        }
        }
    }, [isTyping]);


  return (
    <div className="w-full rounded-xl border border-gray-300 bg-white shadow-sm p-3 focus-within:ring-2 focus-within:ring-blue-500 transition duration-200 ease-in-out ring-blue-400 ring-2">
      <Editor
        apiKey="ccnt3eo64x6n44on3h5gdovvf55edd55yazmyqoiu4i5kh36"
        value={value}
        onInit={(evt, editor) => (editorRef.current = editor)}
        init={{
          height: 450,
          placeholder: 'Type something here...',
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
            'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime',
            'media', 'table', 'help', 'wordcount'
        ],
        toolbar:
            'undo redo | formatselect fontselect fontsizeselect | ' +
            'bold italic underline forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image table | code preview fullscreen',
        fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',
        content_style: `
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 15px;
              color: #1f2937; /* text-gray-800 */
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            table, th, td {
              border: 1px solid #d1d5db; /* gray-300 */
              padding: 8px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          `
        }}
        onEditorChange={onChange}
      />
    </div>
  );
}
