import { notFound, redirect } from 'next/navigation';

export default function DesignReviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  redirect('/');
}