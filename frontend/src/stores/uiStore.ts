import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIStore {
  // Sidebar State
  sidebarOpen: boolean;
  sidebarWidth: number;
  activePanel: 'brand' | 'theme' | 'fonts' | 'settings' | 'export' | null;

  // Right Panel State
  rightPanelOpen: boolean;
  rightPanelContent: 'ai' | 'credits' | 'help' | null;

  // Modal State
  modalOpen: boolean;
  modalContent: 'new-project' | 'save-project' | 'export' | 'ai-generate' | 'settings' | null;

  // Editor State
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Notifications
  notifications: Notification[];

  // Sidebar Actions
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setActivePanel: (panel: UIStore['activePanel']) => void;

  // Right Panel Actions
  toggleRightPanel: () => void;
  setRightPanelContent: (content: UIStore['rightPanelContent']) => void;

  // Modal Actions
  openModal: (content: UIStore['modalContent']) => void;
  closeModal: () => void;

  // Editor Actions
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;

  // Theme Actions
  setTheme: (theme: UIStore['theme']) => void;

  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    // Initial State
    sidebarOpen: true,
    sidebarWidth: 320,
    activePanel: 'brand',

    rightPanelOpen: false,
    rightPanelContent: null,

    modalOpen: false,
    modalContent: null,

    zoom: 100,
    showGrid: false,
    showRulers: false,
    snapToGrid: false,
    gridSize: 10,

    theme: 'system',
    notifications: [],

    // Sidebar Actions
    toggleSidebar: () => set((state) => {
      state.sidebarOpen = !state.sidebarOpen;
    }),

    setSidebarWidth: (width) => set((state) => {
      state.sidebarWidth = Math.max(280, Math.min(480, width));
    }),

    setActivePanel: (panel) => set((state) => {
      state.activePanel = panel;
      if (panel) {
        state.sidebarOpen = true;
      }
    }),

    // Right Panel Actions
    toggleRightPanel: () => set((state) => {
      state.rightPanelOpen = !state.rightPanelOpen;
    }),

    setRightPanelContent: (content) => set((state) => {
      state.rightPanelContent = content;
      if (content) {
        state.rightPanelOpen = true;
      }
    }),

    // Modal Actions
    openModal: (content) => set((state) => {
      state.modalOpen = true;
      state.modalContent = content;
    }),

    closeModal: () => set((state) => {
      state.modalOpen = false;
      state.modalContent = null;
    }),

    // Editor Actions
    setZoom: (zoom) => set((state) => {
      state.zoom = Math.max(25, Math.min(200, zoom));
    }),

    toggleGrid: () => set((state) => {
      state.showGrid = !state.showGrid;
    }),

    toggleRulers: () => set((state) => {
      state.showRulers = !state.showRulers;
    }),

    toggleSnapToGrid: () => set((state) => {
      state.snapToGrid = !state.snapToGrid;
    }),

    setGridSize: (size) => set((state) => {
      state.gridSize = Math.max(5, Math.min(50, size));
    }),

    // Theme Actions
    setTheme: (theme) => set((state) => {
      state.theme = theme;
      // Apply theme to document root
      if (theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }),

    // Notification Actions
    addNotification: (notification) => set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
      };

      state.notifications.push(newNotification);

      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          set((state) => {
            const index = state.notifications.findIndex(n => n.id === newNotification.id);
            if (index !== -1) {
              state.notifications.splice(index, 1);
            }
          });
        }, notification.duration);
      }
    }),

    removeNotification: (id) => set((state) => {
      const index = state.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        state.notifications.splice(index, 1);
      }
    }),

    clearNotifications: () => set((state) => {
      state.notifications = [];
    }),
  }))
);