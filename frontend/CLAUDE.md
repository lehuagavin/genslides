# GenSlides Frontend - Development Guidelines

IMPORTANT: always use latest version of all dependencies.
follow design tokens and global.css in ./src/styles/design-tokens.css and ./src/styles/global.css.

## Technology Stack

- **Language**: TypeScript 5.x
- **Framework**: React 19+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Package Manager**: pnpm (or npm)

## Architecture Principles

### SOLID Principles (Adapted for React)

1. **Single Responsibility**
   - Components do one thing well
   - Separate concerns: UI rendering vs business logic vs data fetching
   - Custom hooks encapsulate specific functionality

2. **Open/Closed**
   - Components accept props for customization
   - Use composition over configuration
   - Extend via wrapper components, not modification

3. **Liskov Substitution**
   - Polymorphic components accept common props
   - Children components work interchangeably when typed correctly

4. **Interface Segregation**
   - Props interfaces contain only what's needed
   - Avoid passing entire objects when only one property is used

5. **Dependency Inversion**
   - Components depend on abstractions (hooks, context)
   - API layer is abstracted behind service functions

### Other Principles

- **KISS**: Prefer simple, readable code over clever solutions
- **YAGNI**: Don't add features or abstractions until needed
- **DRY**: Extract repeated patterns, but not at the cost of readability

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component, routing
│   │
│   ├── components/           # UI Components (organized by feature)
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── TitleInput.tsx
│   │   │   ├── StyleBadge.tsx
│   │   │   ├── CostDisplay.tsx
│   │   │   └── PlayButton.tsx
│   │   ├── Sidebar/
│   │   ├── Preview/
│   │   ├── Player/
│   │   ├── Modals/
│   │   └── common/           # Shared primitive components
│   │
│   ├── stores/               # Zustand state management
│   │   ├── slidesStore.ts
│   │   ├── styleStore.ts
│   │   ├── uiStore.ts
│   │   └── playerStore.ts
│   │
│   ├── api/                  # API client layer
│   │   ├── client.ts         # Fetch/axios configuration
│   │   ├── slides.ts
│   │   ├── style.ts
│   │   ├── images.ts
│   │   └── websocket.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useSlides.ts
│   │   ├── useStyle.ts
│   │   ├── useWebSocket.ts
│   │   └── useKeyboard.ts
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── slides.ts
│   │   ├── style.ts
│   │   └── api.ts
│   │
│   └── utils/                # Pure utility functions
│       └── format.ts
│
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Coding Standards

### TypeScript

Always use strict TypeScript with explicit types:

```typescript
// Good: Explicit types
interface SlideItemProps {
  slide: Slide;
  isSelected: boolean;
  onSelect: (sid: string) => void;
}

// Bad: Implicit any
function SlideItem(props) { ... }
```

### Component Patterns

**Functional components only** with explicit return types:

```typescript
export function SlideItem({ slide, isSelected, onSelect }: SlideItemProps): JSX.Element {
  return (
    <div
      className={cn("p-2 cursor-pointer", isSelected && "bg-blue-100")}
      onClick={() => onSelect(slide.sid)}
    >
      {slide.content}
    </div>
  );
}
```

**Use named exports** for components (not default exports):

```typescript
// Good
export function Header() { ... }

// Bad
export default function Header() { ... }
```

### Props and State

- Use destructuring for props
- Prefer interfaces over types for props
- Keep component state minimal; lift to stores when shared

```typescript
interface Props {
  title: string;
  onTitleChange: (title: string) => void;
}

export function TitleInput({ title, onTitleChange }: Props): JSX.Element {
  // Local UI state only
  const [isEditing, setIsEditing] = useState(false);

  // Shared state from store
  const { isLoading } = useSlidesStore();

  return ...;
}
```

### Zustand Store Pattern

```typescript
// stores/slidesStore.ts
import { create } from 'zustand';
import type { Slide } from '@/types/slides';

interface SlidesState {
  slides: Slide[];
  selectedSid: string | null;
  isLoading: boolean;

  // Actions
  setSlides: (slides: Slide[]) => void;
  selectSlide: (sid: string) => void;
  updateSlide: (sid: string, content: string) => void;
}

export const useSlidesStore = create<SlidesState>((set) => ({
  slides: [],
  selectedSid: null,
  isLoading: false,

  setSlides: (slides) => set({ slides }),
  selectSlide: (sid) => set({ selectedSid: sid }),
  updateSlide: (sid, content) =>
    set((state) => ({
      slides: state.slides.map((s) =>
        s.sid === sid ? { ...s, content } : s
      ),
    })),
}));
```

### Custom Hooks

Encapsulate data fetching and side effects:

```typescript
// hooks/useSlides.ts
export function useSlides(slug: string) {
  const { slides, setSlides, isLoading } = useSlidesStore();

  useEffect(() => {
    const fetchSlides = async () => {
      const data = await api.slides.getProject(slug);
      setSlides(data.slides);
    };
    fetchSlides();
  }, [slug, setSlides]);

  return { slides, isLoading };
}
```

## Concurrency Handling

### WebSocket Connection

```typescript
// hooks/useWebSocket.ts
export function useWebSocket(slug: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const { updateSlideImage } = useSlidesStore();

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3003/ws/slides/${slug}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'generation_completed':
          updateSlideImage(message.data.sid, message.data.image);
          break;
        // Handle other message types
      }
    };

    return () => {
      ws.close();
    };
  }, [slug, updateSlideImage]);

  return wsRef;
}
```

### Debouncing User Input

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in component
const debouncedContent = useDebounce(content, 500);

useEffect(() => {
  if (debouncedContent !== originalContent) {
    api.slides.update(slug, sid, debouncedContent);
  }
}, [debouncedContent]);
```

### Optimistic Updates

```typescript
// In store action
updateSlide: async (sid, content) => {
  // Optimistically update UI
  set((state) => ({
    slides: state.slides.map((s) =>
      s.sid === sid ? { ...s, content } : s
    ),
  }));

  try {
    // Sync with server
    await api.slides.update(slug, sid, content);
  } catch (error) {
    // Revert on failure
    set((state) => ({ ... }));
    throw error;
  }
}
```

## Error Handling

### API Error Handling

```typescript
// api/client.ts
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      error.error?.code ?? 'UNKNOWN_ERROR',
      error.error?.message ?? 'An error occurred',
      response.status
    );
  }

  return response.json();
}
```

### Component Error Boundaries

```typescript
// components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### User-Facing Errors

Use toast notifications for transient errors:

```typescript
// stores/uiStore.ts
interface UIState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Usage
try {
  await generateImage(sid);
} catch (error) {
  addToast({
    type: 'error',
    message: error instanceof ApiError ? error.message : 'Failed to generate image'
  });
}
```

## Logging

### Development Logging

Use conditional logging that only runs in development:

```typescript
// utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.info('[GenSlides]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[GenSlides]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[GenSlides]', ...args);  // Always log errors
  },
};
```

### WebSocket Event Logging

```typescript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  logger.info('WS received:', message.type, message.data);
  // Handle message...
};
```

## Testing

### Component Tests

```typescript
// components/Header/Header.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

describe('Header', () => {
  it('displays the project title', () => {
    render(<Header title="Test Project" />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('calls onTitleChange when title is edited', async () => {
    const onTitleChange = vi.fn();
    render(<Header title="Test" onTitleChange={onTitleChange} />);

    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'New Title');

    expect(onTitleChange).toHaveBeenCalledWith('New Title');
  });
});
```

### Store Tests

```typescript
// stores/slidesStore.test.ts
import { useSlidesStore } from './slidesStore';

describe('slidesStore', () => {
  beforeEach(() => {
    useSlidesStore.setState({ slides: [], selectedSid: null });
  });

  it('selects a slide', () => {
    useSlidesStore.getState().selectSlide('slide-001');
    expect(useSlidesStore.getState().selectedSid).toBe('slide-001');
  });
});
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Styling Guidelines

### Tailwind CSS

- Use utility classes directly in components
- Extract common patterns to component variants, not CSS
- Use `cn()` helper for conditional classes

```typescript
import { cn } from '@/utils/cn';

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded font-medium transition-colors",
        variant === 'primary' && "bg-blue-500 text-white hover:bg-blue-600",
        variant === 'secondary' && "bg-gray-200 text-gray-800 hover:bg-gray-300",
        className
      )}
      {...props}
    />
  );
}
```

### Responsive Design

- Mobile-first approach
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test on common screen sizes
