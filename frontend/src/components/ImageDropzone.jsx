import { useRef, useState } from 'react';
import { uploadImage } from '../lib/api.js';

const MAX = 5;

/**
 * 드래그 앤 드롭 이미지 업로드.
 * 파일을 놓는 즉시 로컬 미리보기(ObjectURL)를 보여 주고, 업로드는 백그라운드로 진행한다.
 * images: [{ key, preview, url, status: 'uploading' | 'done' | 'error' }]
 */
export default function ImageDropzone({ images, setImages }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/')).slice(0, MAX - images.length);
    files.forEach((file) => {
      const key = crypto.randomUUID();
      setImages((prev) => [...prev, { key, preview: URL.createObjectURL(file), url: null, status: 'uploading' }]);
      uploadImage(file)
        .then(({ url }) => setImages((prev) => prev.map((img) => (img.key === key ? { ...img, url, status: 'done' } : img))))
        .catch(() => setImages((prev) => prev.map((img) => (img.key === key ? { ...img, status: 'error' } : img))));
    });
  };

  const remove = (key) => setImages((prev) => prev.filter((img) => img.key !== key));

  return (
    <div
      className={`dropzone ${dragOver ? 'over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
    >
      <div className="upload-list">
        {images.map((img, i) => (
          <div key={img.key} className={`thumb ${img.status}`}>
            <img src={img.preview} alt="" />
            {i === 0 && <span className="thumb-label">대표</span>}
            {img.status === 'uploading' && <span className="thumb-state">업로드 중…</span>}
            {img.status === 'error' && <span className="thumb-state">실패</span>}
            <button type="button" onClick={() => remove(img.key)} aria-label="사진 삭제">×</button>
          </div>
        ))}
        {images.length < MAX && (
          <button type="button" className="upload-add" onClick={() => inputRef.current.click()}>
            <b>＋</b><span>{images.length}/{MAX}</span>
          </button>
        )}
      </div>
      <p className="muted" style={{ margin: '10px 0 0' }}>사진을 여기로 끌어다 놓거나 ＋를 눌러 추가하세요.</p>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden
             onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
