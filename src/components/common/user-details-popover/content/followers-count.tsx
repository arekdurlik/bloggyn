import { useFollowingButton } from '@/components/common/user-details-popover/content/following-button-context';

export default function FollowersCount() {
    const { localCount } = useFollowingButton();
    return <span>{localCount == 1 ? '1 follower' : `${localCount} followers`}</span>;
}
