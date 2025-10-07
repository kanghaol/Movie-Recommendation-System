
import Link from 'next/link';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

export default function Header() {
    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <Link href="/" className="text-2xl font-bold">
                Movie Recommendation
            </Link>

            <Link href="/profile">
                    <Avatar>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
            </Link>
        </header>
    );
}