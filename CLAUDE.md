# AI Agent Instructions: Fintech Club Website

## 1. Project Context

This is the public-facing website for our university Fintech Club. The design must be clean, professional, and high-performance.

## 2. Tech Stack & Environment

- **Framework:** React (via Vite)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **Routing:** React Router (if applicable)

## 3. Verification Commands (Agent Must Run These)

- Start Dev Server: `npm run dev`
- Type Check: `npm run typecheck` (tsc --noEmit)
- Lint: `npm run lint`
- Build: `npm run build`

## 4. Strict Coding Rules

### TypeScript

- **NEVER use `any`.** You must define proper `interface` or `type` definitions for all component props, state, and API responses.
- Enable and respect strict null checks.
- Use modern TS features (optional chaining, nullish coalescing).

### React & Architecture

- Write functional components only. No class components.
- Keep components small and focused (target < 150 lines). If it grows larger, extract sub-components.
- Extract reusable logic into custom hooks (e.g., `useMarketData`, `useScrollPosition`).
- Place all reusable UI components (buttons, cards) in `src/components/ui`.

### Styling (Tailwind CSS)

- Use Tailwind utility classes exclusively. DO NOT write custom CSS in `.css` files unless absolutely required for complex animations.
- The website should be fully responsive across all the devices. Use mobile-first responsive design (e.g., `p-4 md:p-8`).
- Keep class strings clean. Group related utilities together.

## 5. Agent Execution Protocol

1. **No Guessing:** If the user asks for a feature and the required UI component does not exist, ask the user if you should build it or use a placeholder.
2. **Self-Correction:** After modifying ANY `.ts` or `.tsx` file, you MUST independently run `npm run typecheck` in the background. If errors occur, fix them before showing the output to the user.
3. **No Unprompted Upgrades:** Do not modify `package.json` dependencies unless explicitly instructed.
