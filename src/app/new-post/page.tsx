import { Suspense } from 'react';
import Editor from './editor'

export default function Home() {
    return <div>
        WRITE
        <Suspense fallback={null}>
            <Editor/>
        </Suspense>
    </div>;
}
