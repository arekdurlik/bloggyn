import { Suspense } from 'react';
import Editor from '../../components/editor'
import TransitionLink from '@/components/common/page-transition/transition-link';

export default function Home() {
    return <div>
        <Suspense fallback={null}>
            <Editor/>
        </Suspense>
    </div>;
}
