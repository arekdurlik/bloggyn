import { cn } from '@/lib/helpers';
import formStyles from './forms.module.scss';

export function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className={formStyles.form}>
            <div className="animation-appear--sloth">
                <div className={cn(formStyles.spinner)}>
                    <svg viewBox="0 0 100 100" width="100" height="100">
                        <defs>
                            <path
                                id="circle"
                                d="
                            M 50, 50
                            m -37, 0
                            a 37,37 0 1,1 74,0
                            a 37,37 0 1,1 -74,0"
                            />
                        </defs>
                        <text fill="currentColor">
                            <textPath xlinkHref="#circle">
                                bloggyn bloggyn bloggyn
                            </textPath>
                        </text>
                    </svg>
                </div>
            </div>
            <div className={formStyles.contentWrapper}>
                {children}
            </div>
        </div>
    );
}
