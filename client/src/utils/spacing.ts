import { designTokens } from '../design/tokens';

export const spacing = {
  // Component spacing
  component: {
    padding: {
      xs: designTokens.spacing.sm,
      sm: designTokens.spacing.md,
      md: designTokens.spacing.lg,
      lg: designTokens.spacing.xl,
      xl: designTokens.spacing['2xl'],
    },
    margin: {
      xs: designTokens.spacing.sm,
      sm: designTokens.spacing.md,
      md: designTokens.spacing.lg,
      lg: designTokens.spacing.xl,
      xl: designTokens.spacing['2xl'],
    },
    gap: {
      xs: designTokens.spacing.sm,
      sm: designTokens.spacing.md,
      md: designTokens.spacing.lg,
      lg: designTokens.spacing.xl,
      xl: designTokens.spacing['2xl'],
    },
  },
  
  // Layout spacing
  layout: {
    container: {
      padding: {
        mobile: designTokens.spacing.md,
        tablet: designTokens.spacing.lg,
        desktop: designTokens.spacing['2xl'],
      },
    },
    section: {
      margin: {
        mobile: designTokens.spacing.xl,
        tablet: designTokens.spacing['2xl'],
        desktop: designTokens.spacing['3xl'],
      },
      padding: {
        mobile: designTokens.spacing.lg,
        tablet: designTokens.spacing.xl,
        desktop: designTokens.spacing['2xl'],
      },
    },
  },
  
  // Card and component spacing
  card: {
    padding: {
      sm: designTokens.spacing.md,
      md: designTokens.spacing.lg,
      lg: designTokens.spacing.xl,
    },
    gap: {
      sm: designTokens.spacing.sm,
      md: designTokens.spacing.md,
      lg: designTokens.spacing.lg,
    },
  },
};

// Helper functions for responsive spacing
export const getResponsivePadding = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => ({
  xs: spacing.component.padding.xs,
  sm: spacing.component.padding[size] || spacing.component.padding.md,
  md: spacing.component.padding[size] || spacing.component.padding.md,
});

export const getResponsiveMargin = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => ({
  xs: spacing.component.margin.xs,
  sm: spacing.component.margin[size] || spacing.component.margin.md,
  md: spacing.component.margin[size] || spacing.component.margin.md,
});

// Grid spacing utilities
export const gridSpacing = {
  container: {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  },
  item: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
};