import { faRocket } from '@fortawesome/free-solid-svg-icons/faRocket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className='flex h-screen items-center justify-center'>
        <div className='p-5'>
          <h1 className='mb-5 text-5xl'>
            Vite-Quick-Start <FontAwesomeIcon icon={faRocket} />
          </h1>
          <p> A Vite + React + Tailwind CSS + TypeScript quick start template.</p>
          <br />
          <button
            onClick={() => setCount((count) => count + 1)}
            className='m-2 rounded border bg-blue-300 p-3 transition hover:bg-blue-500 hover:text-white'
          >
            Count is {count}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
