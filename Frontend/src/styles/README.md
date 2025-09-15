# Shared UI Components Style Library

This directory contains reusable SCSS components that provide consistent styling across the entire application. The components follow the glassmorphism design system and are fully responsive.

## Structure

```
styles/
├── components/
│   ├── cards.scss          # Card layouts (glass, list, info, stat)
│   ├── buttons.scss        # Button variants and states
│   ├── forms.scss          # Form controls and validation
│   ├── modals.scss         # Modal dialogs and overlays
│   ├── filters.scss        # Search, filters, and sorting
│   ├── empty-states.scss   # Loading, empty, error states
│   ├── pagination.scss     # Pagination and load more
│   ├── tags.scss           # Tags, badges, and indicators
│   ├── icons.scss          # Icon styling and layouts
│   └── progress-bars.scss  # Progress indicators
├── variables.scss          # Design tokens and variables
├── mixins.scss            # Reusable mixins
└── index.scss             # Main import file
```

## Usage

### 1. Import the entire library

```scss
@use "../../styles/index.scss";
```

### 2. Import specific components

```scss
@use "../../styles/components/cards";
@use "../../styles/components/buttons";
```

### 3. Use variables and mixins

```scss
@use "../../styles/variables" as *;
@use "../../styles/mixins" as *;

.my-component {
  background: $glass-bg;
  @include glass-effect;
}
```

## Component Examples

### Cards

#### Glass Card (Basic)

```html
<div class="glass-card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```

#### List Card (Horizontal Layout)

```html
<div class="list-card">
  <div class="card-info">
    <div class="card-avatar">JD</div>
    <div class="card-details">
      <h3>John Doe</h3>
      <div class="card-subtitle">
        <i class="fas fa-phone"></i>
        +1 234 567 8900
      </div>
    </div>
  </div>
  <div class="card-actions">
    <button class="icon-btn view-btn"><i class="fas fa-eye"></i></button>
    <button class="icon-btn edit-btn"><i class="fas fa-edit"></i></button>
  </div>
</div>
```

#### Stat Card

```html
<div class="stat-card">
  <div class="stat-icon success">
    <i class="fas fa-check"></i>
  </div>
  <div class="stat-content">
    <h3>1,234</h3>
    <p>Total Contacts</p>
  </div>
</div>
```

### Buttons

#### Primary Button

```html
<button class="btn-primary">
  <i class="fas fa-plus"></i>
  Create New
</button>
```

#### Action Buttons

```html
<button class="action-btn view-btn" title="View">
  <i class="fas fa-eye"></i>
</button>
<button class="action-btn edit-btn" title="Edit">
  <i class="fas fa-edit"></i>
</button>
<button class="action-btn delete-btn" title="Delete">
  <i class="fas fa-trash"></i>
</button>
```

#### Tab Buttons

```html
<div class="modal-tabs">
  <button class="tab-btn active">
    <i class="fas fa-chart-bar"></i>
    Overview
  </button>
  <button class="tab-btn">
    <i class="fas fa-envelope"></i>
    Messages
  </button>
</div>
```

### Forms

#### Form Section

```html
<div class="form-section">
  <h3>Campaign Details</h3>

  <div class="form-group">
    <label for="name">Campaign Name</label>
    <input
      type="text"
      id="name"
      class="form-control"
      placeholder="Enter campaign name"
    />
    <span class="error-message">This field is required</span>
  </div>

  <div class="form-group">
    <label for="template">Message Template</label>
    <select id="template" class="form-control">
      <option value="">Select a template</option>
      <option value="1">Welcome Message</option>
    </select>
  </div>
</div>
```

#### Checkbox Grid

```html
<div class="tags-grid">
  <div class="tag-option">
    <input type="checkbox" id="tag1" />
    <label for="tag1" class="tag-label">Marketing</label>
  </div>
  <div class="tag-option">
    <input type="checkbox" id="tag2" />
    <label for="tag2" class="tag-label">Sales</label>
  </div>
</div>
```

### Modals

#### Basic Modal

```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2>Modal Title</h2>
      <button class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="modal-body">
      <!-- Modal content -->
    </div>

    <div class="modal-actions">
      <button class="btn-secondary cancel-btn">Cancel</button>
      <button class="btn-primary save-btn">Save</button>
    </div>
  </div>
</div>
```

#### Confirmation Modal

```html
<div class="modal-overlay">
  <div class="modal confirm-modal">
    <h3>Confirm Action</h3>
    <p>Are you sure you want to delete this item?</p>
    <p class="warning">This action cannot be undone.</p>

    <div class="modal-actions">
      <button class="btn-secondary cancel-btn">Cancel</button>
      <button class="btn-danger delete-btn">Delete</button>
    </div>
  </div>
</div>
```

### Progress Bars

#### Standard Progress Bar

```html
<div class="progress-section">
  <div class="progress-header">
    <span>Campaign Progress</span>
    <span>75%</span>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: 75%"></div>
  </div>
  <p class="progress-text">3 of 4 steps completed</p>
</div>
```

#### Circular Progress

```html
<div class="progress-circle success" style="--percentage: 85">
  <span>85%</span>
</div>
```

### Tags & Badges

#### Basic Tags

```html
<div class="tags-container">
  <span class="tag">Marketing</span>
  <span class="tag-success">Active</span>
  <span class="tag-warning">Pending</span>
</div>
```

#### Status Badges

```html
<div class="status-badge running">
  <i class="fas fa-play"></i>
  Running
</div>
<div class="status-badge completed">
  <i class="fas fa-check"></i>
  Completed
</div>
```

### Empty States

#### Loading State

```html
<div class="loading-state">
  <i class="fas fa-spinner"></i>
  <p>Loading data...</p>
  <div class="loading-text">Please wait while we fetch your information</div>
</div>
```

#### Empty State

```html
<div class="empty-state">
  <div class="empty-icon">
    <i class="fas fa-inbox"></i>
  </div>
  <h3>No campaigns found</h3>
  <p>
    You haven't created any campaigns yet. Create your first campaign to get
    started.
  </p>
  <a href="#" class="empty-action">
    <i class="fas fa-plus"></i>
    Create Campaign
  </a>
</div>
```

#### Error State

```html
<div class="error-state">
  <div class="error-icon">
    <i class="fas fa-exclamation-triangle"></i>
  </div>
  <h3>Something went wrong</h3>
  <p>We encountered an error while loading your data.</p>

  <div class="error-details">
    <div class="error-code">Error 500</div>
    <div class="error-message">Internal server error occurred</div>
  </div>

  <div class="error-actions">
    <button class="retry-btn">
      <i class="fas fa-redo"></i>
      Try Again
    </button>
    <button class="report-btn">
      <i class="fas fa-bug"></i>
      Report Issue
    </button>
  </div>
</div>
```

### Filters & Search

#### Search Box

```html
<div class="search-box">
  <i class="fas fa-search search-icon"></i>
  <input type="search" placeholder="Search campaigns..." />
  <button class="clear-search">
    <i class="fas fa-times"></i>
  </button>
</div>
```

#### Filter Bar

```html
<div class="filter-bar">
  <div class="filter-group">
    <label>Status:</label>
    <select>
      <option>All Statuses</option>
      <option>Active</option>
      <option>Completed</option>
    </select>
  </div>

  <div class="filter-group">
    <label>Type:</label>
    <select>
      <option>All Types</option>
      <option>Text</option>
      <option>Image</option>
    </select>
  </div>

  <div class="filter-actions">
    <button class="clear-filters">Clear Filters</button>
  </div>
</div>
```

### Pagination

#### Standard Pagination

```html
<div class="pagination">
  <div class="pagination-info">
    Showing <strong>1-10</strong> of <strong>234</strong> results
  </div>

  <div class="pagination-controls">
    <button class="pagination-btn nav-btn prev" disabled>
      <i class="fas fa-chevron-left"></i>
      Previous
    </button>

    <button class="pagination-btn current">1</button>
    <button class="pagination-btn">2</button>
    <button class="pagination-btn">3</button>
    <span class="pagination-ellipsis">...</span>
    <button class="pagination-btn">23</button>

    <button class="pagination-btn nav-btn next">
      Next
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>

  <div class="page-size-selector">
    <label>Show:</label>
    <select>
      <option>10</option>
      <option>25</option>
      <option>50</option>
    </select>
  </div>
</div>
```

#### Compact Pagination

```html
<div class="pagination-compact">
  <div class="pagination-info">
    Page <strong>1</strong> of <strong>23</strong>
  </div>

  <div class="pagination-nav">
    <button class="nav-btn" disabled>
      <i class="fas fa-chevron-left"></i>
      Previous
    </button>
    <button class="nav-btn">
      Next
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</div>
```

## Design Tokens

### Colors

- `$primary-cyan`: #64ffda
- `$secondary-blue`: #7fdbff
- `$accent-blue`: #00b4d8
- `$success`: #22c55e
- `$warning`: #f97316
- `$danger`: #ef4444
- `$info`: #3b82f6

### Spacing

- `$spacing-xs`: 0.25rem
- `$spacing-sm`: 0.5rem
- `$spacing-md`: 1rem
- `$spacing-lg`: 1.5rem
- `$spacing-xl`: 2rem

### Breakpoints

- `$mobile`: 480px
- `$tablet`: 768px
- `$desktop`: 1024px
- `$wide`: 1200px

## Customization

You can override any component styles by importing the component and adding your custom styles:

```scss
@use "../../styles/components/cards";

.my-custom-card {
  @extend .glass-card;

  // Custom overrides
  border: 2px solid $primary-cyan;

  &:hover {
    transform: scale(1.02);
  }
}
```

## Best Practices

1. **Use semantic class names**: Choose classes that describe the purpose, not the appearance
2. **Maintain consistency**: Use the provided design tokens for colors, spacing, and breakpoints
3. **Mobile-first approach**: All components are responsive by default
4. **Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Performance**: Import only the components you need

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- CSS custom properties (CSS variables) support required
- Backdrop-filter support for glassmorphism effects
