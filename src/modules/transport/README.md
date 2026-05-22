# Transport Module - MySawit Frontend

## Overview

Complete transport module implementation for MySawit palm field management platform. Handles palm oil delivery workflows from plantation to factory, including:

- **Foreman workflows:** View deliveries, approve/reject arrived shipments
- **Truck Driver workflows:** Manage active deliveries, update status, view history
- **Central Admin workflows:** Monitor all deliveries, verify factories, handle partial rejections, manage payroll

## Architecture

```
src/modules/transport/
├── types.ts                          # Core types (Delivery, Status enums)
├── mockData.ts                       # Mock data for development
├── deliveryUtils.ts                  # Utility functions and filters
├── hooks/
│   └── useDeliveryFilters.ts        # Custom hook for filtering logic
├── components/
│   ├── StatusBadge.tsx              # Status visualization
│   ├── StatusTimeline.tsx           # Delivery progress timeline
│   ├── DeliveryCard.tsx             # Reusable card component
│   └── RejectModal.tsx              # Rejection workflow modal
└── pages/
    ├── foreman-deliveries-page.tsx  # Foreman list + filters
    ├── delivery-detail-page.tsx     # Foreman approval detail
    ├── driver-active-page.tsx       # Driver active/history
    ├── driver-delivery-detail-page.tsx # Driver status update
    ├── admin-deliveries-page.tsx    # Admin dashboard
    └── admin-delivery-detail-page.tsx # Admin approval/rejection
```

## Key Features

### Delivery Status Management
- **States:** Loading → Transporting → Arrived → Approved/Rejected
- **Capacity constraint:** Maximum 400 kg per delivery (truck capacity)
- **Timeline tracking:** Timestamps recorded at each stage

### Role-Based Workflows

#### Foreman
- View all deliveries assigned to plantation
- Filter by status, driver, date, search term
- Approve arrived deliveries (full or partial)
- Reject deliveries with reason
- See delivery history with status

#### Truck Driver
- View active deliveries in progress
- Update delivery status (Loading → Transporting → Arrived)
- View delivery history with foreman approval status
- See rejection reasons for failed deliveries
- Mobile-optimized interface

#### Central Admin
- Dashboard with KPIs (approved, pending, rejected counts)
- Filter deliveries by foreman, date, status
- Review foreman-approved deliveries
- Full/partial rejection with weight recognition
- Partial approval payroll calculation
- Factory verification workflow

### Integration Points

The module is structured for easy backend API integration:

```typescript
// Replace mock data with API calls
const deliveries = await fetch('/api/deliveries').then(r => r.json());

// Status updates via API
await fetch(`/api/deliveries/${id}/approve`, { method: 'POST', body: approvalData });

// Real-time notifications via WebSocket or polling
listenToNotifications(userId, (notification) => {
  // Refresh delivery status, show notification
});
```

## Design System Compliance

- **Color scheme:** Deep Forest (#415B2B), Leaf Green (#80B048), Earthy Wood (#774E15), Warm Cream (#FFFFF1)
- **Typography:** Syne (headings), Plus Jakarta Sans (UI/body)
- **Component style:** Rounded cards, soft borders, generous spacing
- **Accessibility:** WCAG AA compliant, keyboard navigation supported

## Testing Coverage

### Unit Tests
- `deliveryUtils.test.ts`: Status checks, capacity calculation, filtering

### Integration Test Scenarios (see INTEGRATION_TESTS.md)
1. Harvest → Delivery → Approval (happy path)
2. Over-capacity prevention
3. Foreman rejection workflow
4. Partial rejection by admin
5. Full admin rejection
6. Driver status transitions
7. Admin dashboard visibility

## Mock Data

Current mock deliveries in `mockData.ts`:
- 4 sample deliveries at various stages
- Plantation: Sawit Jaya
- Multiple drivers and laborers
- Real-world weight distributions

## Development Setup

```bash
# The module uses Next.js App Router and is ready to integrate
# Import components where needed:
import { DeliveryCard, StatusBadge } from '@/modules/transport/components';
import { getDeliveriesByForeman } from '@/modules/transport/mockData';

# Replace mock data with actual API calls when backend is ready
```

## API Integration TODO

Update these functions when backend endpoints are available:

```typescript
// src/modules/transport/api.ts (to be created)
export async function fetchDeliveries(filters) { }
export async function approveDelivery(deliveryId, reason) { }
export async function rejectDelivery(deliveryId, reason) { }
export async function updateDeliveryStatus(deliveryId, status) { }
export async function partialRejectDelivery(deliveryId, recognizedWeight, reason) { }
```

## Styling Notes

- Uses Tailwind CSS 4 with custom color variables
- Responsive design: Mobile-first for drivers, desktop for admin
- No external UI library dependencies (pure React + Tailwind)
- Dark mode support ready (color system extensible)

## Next Steps

1. **Backend integration:** Connect to actual delivery API endpoints
2. **Authentication:** Integrate with auth module for role-based access
3. **Notifications:** Connect to notification system for real-time updates
4. **Payroll integration:** Trigger payroll calculations on approval
5. **E2E testing:** Add Playwright/Cypress tests for user workflows
6. **Performance:** Add delivery pagination for large datasets

## Files Structure Checklist

- ✅ Types and interfaces
- ✅ Mock data generators
- ✅ Utility functions
- ✅ Custom hooks
- ✅ Reusable components
- ✅ Foreman pages
- ✅ Driver pages
- ✅ Admin pages
- ✅ Integration test documentation
- ✅ Unit tests structure
- ⏳ API integration layer
- ⏳ Real-time notifications
- ⏳ Payroll calculations

## Version
v0.1.0 - MVP complete, ready for backend integration
