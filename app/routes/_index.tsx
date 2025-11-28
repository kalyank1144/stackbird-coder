import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { LandingPage } from '~/components/landing/LandingPage';

export const meta: MetaFunction = () => {
  return [
    { title: 'Stackbird - Build apps with AI' },
    { name: 'description', content: 'Create stunning apps and websites by chatting with AI. No coding required.' },
  ];
};

export const loader = () => json({ id: undefined });

export default function Index() {
  return <ClientOnly fallback={<div className="min-h-screen bg-black" />}>{() => <LandingPage />}</ClientOnly>;
}
