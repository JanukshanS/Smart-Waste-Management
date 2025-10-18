export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
}));

export const useLocalSearchParams = jest.fn(() => ({}));

export const useGlobalSearchParams = jest.fn(() => ({}));

export const usePathname = jest.fn(() => '/');

export const useSegments = jest.fn(() => []);

export const Stack = {
  Screen: ({ children }) => children,
};

export const Tabs = {
  Screen: ({ children }) => children,
};

export const Slot = ({ children }) => children;

export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};

export default {
  useRouter,
  useLocalSearchParams,
  useGlobalSearchParams,
  usePathname,
  useSegments,
  Stack,
  Tabs,
  Slot,
  router,
};
