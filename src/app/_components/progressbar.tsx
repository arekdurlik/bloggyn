'use client';

import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
    return (
        <AppProgressBar
            options={{ showSpinner: false }}
            shallowRouting
            delay={200}
            style={`
            #nprogress {
                pointer-events: none;
            }

            @keyframes appear {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }

            #nprogress .bar {
                background: var(--progressBarColor);
                animation: appear var(--transition-slow) forwards;

                position: fixed;
                z-index: 99999;
                top: 0;
                left: 0;

                width: 100%;
                height: 4px;
            }

            /* Fancy blur effect */
            #nprogress .peg {
                display: block;
                position: absolute;
                right: 0px;
                width: 100px;
                height: 100%;
                box-shadow: 0 0 10px var(--progressBarColor), 0 0 5px var(--progressBarColor);
                opacity: 1.0;

                -webkit-transform: rotate(3deg) translate(0px, -4px);
                    -ms-transform: rotate(3deg) translate(0px, -4px);
                        transform: rotate(3deg) translate(0px, -4px);
            }
        `}
        />
    );
}
