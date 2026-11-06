import type { SocialLink } from '../links.ts'

// Ikony sociálních sítí převzaté z webu prg.ai (stejné tvary jako v patičce prg.ai)
const PATHS: Record<SocialLink['network'], string> = {
  linkedin:
    'm141 438l0-260-81 0 0 260z m0-352c-1-23-16-41-42-41-25 0-41 18-41 41 0 23 16 41 40 41l1 0c26 0 42-18 42-41z m131 352l0-148c0-8 0-16 3-21 6-16 21-33 45-33 32 0 52 18 52 54l0 148 81 0 0-152c0-81-44-119-102-119-47 0-68 26-80 44l1-34-81 0c1 24 0 261 0 261z',
  facebook: 'm198 453l0-206-42 0 0-68 42 0 0-41c0-55 17-95 77-95l73 0 0 68-51 0c-26 0-31 16-31 34l0 34 78 0-11 68-67 0 0 206z',
  instagram:
    'm355 0c87 0 157 70 157 157l0 198c0 87-70 157-157 157l-198 0c-87 0-157-70-157-157l0-198c0-87 70-157 157-157z m0 42l-198 0c-64 0-115 51-115 115l0 198c0 64 51 115 115 115l198 0c64 0 115-51 115-115l0-198c0-64-51-115-115-115z m-98 81c36 0 70 14 95 39 26 25 40 59 40 95 0 74-60 134-134 134-74 0-134-60-134-134-1-74 59-134 133-134z m0 41c-51 1-92 42-92 93 0 37 23 71 57 85 35 14 74 7 101-20 26-26 34-66 20-101-15-34-48-57-86-57z m136-75c8 0 15 3 21 9 5 5 9 13 9 21 0 16-14 30-30 30-17 0-30-14-30-30 0-17 13-30 30-30z',
}

export function SocialIcon({ network, className }: { network: SocialLink['network']; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" aria-hidden="true" fill="currentColor">
      <path d={PATHS[network]} />
    </svg>
  )
}
