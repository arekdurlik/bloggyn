'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { trpc } from '@/trpc/client';
import TextInput from '@/components/common/text-input/text-input';
import Button from '@/components/common/button';
import Github from '@/components/common/icons/github';

import formStyles from '../forms.module.scss';
import Google from '@/components/common/icons/google';

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const signUp = trpc.signUp.useMutation();

    async function handleSignUp() {
        try {
            signUp.mutate(formData);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={formStyles.form}>
            <div className={formStyles.spinner}>
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
                    <text>
                        <textPath xlinkHref="#circle">
                            bloggyn bloggyn bloggyn
                        </textPath>
                    </text>
                </svg>
            </div>
            <div className={formStyles.content}>
                <h2 className={formStyles.header}>Sign up</h2>
                <div className={formStyles.inputGroup}>
                    <Button
                        onClick={() => signIn('github', { redirect: false })}
                    >
                        <Google />
                        Continue with Google
                    </Button>
                    <Button
                        onClick={() => signIn('github', { redirect: false })}
                    >
                        <Github />
                        Continue with Github
                    </Button>
                </div>
                <div className={formStyles.divider}>
                    or continue with e-mail
                </div>
                <div className={formStyles.inputGroup}>
                    <TextInput
                        prefixIcon={<Mail />}
                        label="E-mail"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={e =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                    <TextInput
                        prefixIcon={<Lock />}
                        label="Password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={formData.password}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                    />
                    <Button
                        onClick={handleSignUp}
                        inverted
                        style={{ marginTop: 10 }}
                    >
                        Join bloggyn
                        <ArrowRight />
                    </Button>
                </div>
                <span className={formStyles.terms}>
                    By signing up, you agree that your data may be deleted at
                    any time, without prior notice or confirmation.
                </span>
            </div>
        </div>
    );
}
