# UI Rules

## Core
- Use Tailwind tokens from `tailwind.config.js`
- Use CSS variables from `globals.css`
- Avoid raw values

## Styling
- Use `cn()` / `twMerge`
- No inline styles
- No hard-coded hex

## Tokens
- Colors → bg-bg text-foreground border-border
- Spacing → p-sm gap-md mt-lg
- Radius → rounded-sm md lg
- Shadow → shadow-sm md

## Arbitrary Allowed
- calc()
- CSS variables
- grid templates
- transform

## Arbitrary Forbidden
- spacing → mt-[17px]
- color → bg-[#fff]
- typography → text-[13px]
- shadow → shadow-[...]

## Components
- btn / btn-primary
- card
- input

## Icons
- lucide-react
- w-4 h-4 / w-5 h-5

## Layout
- min-h-screen flex flex-col
- header / main flex-1 / footer

## Animation
- transition-all duration-300
- hover:scale-[1.01]

## Accessibility
- label + htmlFor
- aria-label for icon buttons

## Modal
- Use `modal-overlay` class for overlay
- Use `modal-content` class for content
- Use `modal-header` class for header
- Use `modal-body` class for body
- Use `modal-footer` class for footer