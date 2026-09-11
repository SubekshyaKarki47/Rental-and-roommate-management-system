import React, { useState, useEffect } from 'react';
import {
  Building,
  Home,
  ClipboardList,
  CreditCard,
  Wrench,
  FileText,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  Plus,
  MapPin,
  TrendingUp,
  Users,
  BarChart3,
  Menu,
  X,
  CheckCircle2,
  Download,
  Edit3,
  Trash2,
  Receipt,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MessagesInboxSubview } from '../dashboard/subviews/MessagesInboxSubview';
import { CreateListingModal } from '../properties/CreateListingModal';
import { propertyService } from '../../services/propertyService';
import { applicationService } from '../../services/applicationService';
import { maintenanceService } from '../../services/maintenanceService';
import { agreementService, type RentalAgreement } from '../../services/agreementService';
import { api } from '../../services/api';
import type { Property } from '../../types/property';
import './LandlordDashboard.css';

interface LandlordDashboardProps {
}

interface LandlordProperty {
  id: number;
  title: string;
  city: string;
  area: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
  tenantName: string;
  leaseExpiry: string;
  image: string;
}

interface LandlordApplication {
  id: number;
  propertyId?: number;
  property_details?: { id: number; title: string };
  tenant?: { full_name?: string; first_name?: string; last_name?: string; email?: string };
  applicantName: string;
  email: string;
  property: string;
  monthlyIncome: number;
  occupation: string;
  moveInDate: string;
  move_in_date?: string;
  status: string;
  creditScore: string;
}

interface MaintenanceTicket {
  id: number;
  unit: string;
  title: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | string;
  date: string;
  assignedTo: string;
}

const INITIAL_PROPERTIES: LandlordProperty[] = [
  {
    id: 1,
    title: 'Modern 2BHK Apartment in Shantinagar',
    city: 'Kathmandu',
    area: 'Baneshwor',
    rent: 25000,
    bedrooms: 2,
    bathrooms: 2,
    status: 'OCCUPIED',
    tenantName: 'Subekshya Karki',
    leaseExpiry: 'Oct 2027',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Cozy Room in Shared Apartment',
    city: 'Lalitpur',
    area: 'Sanepa',
    rent: 14000,
    bedrooms: 1,
    bathrooms: 1,
    status: 'VACANT',
    tenantName: 'None',
    leaseExpiry: 'Immediate Move-in',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80',
  },
];

const INITIAL_APPLICATIONS: LandlordApplication[] = [
  {
    id: 501,
    propertyId: 2,
    applicantName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    property: 'Cozy Room in Shared Apartment - Sanepa',
    monthlyIncome: 65000,
    occupation: 'Software Engineer',
    moveInDate: 'Sep 25, 2026',
    status: 'APPROVED',
    creditScore: 'Excellent',
  },
  {
    id: 502,
    propertyId: 1,
    applicantName: 'Sneha Gurung & Co.',
    email: 'sneha.g@example.com',
    property: 'Modern 2BHK Apartment in Shantinagar',
    monthlyIncome: 90000,
    occupation: 'Doctors (Civil Hospital)',
    moveInDate: 'Oct 1, 2026',
    status: 'PENDING',
    creditScore: 'Verified',
  },
];

// Helper to auto-sync properties with approved applications
const syncPropertiesWithApplications = (
  propsList: LandlordProperty[],
  appsList: LandlordApplication[]
): LandlordProperty[] => {
  return propsList.map((p) => {
    const approvedApp = appsList.find(
      (a: LandlordApplication) =>
        a.status === 'APPROVED' &&
        ((a.propertyId && a.propertyId === p.id) ||
          (a.property_details?.id && a.property_details.id === p.id) ||
          (typeof a.property === 'string' &&
            (a.property.toLowerCase().includes(p.title.toLowerCase()) ||
              p.title.toLowerCase().includes(a.property.toLowerCase()) ||
              (a.property.toLowerCase().includes(p.area.toLowerCase()) &&
                a.property.toLowerCase().includes(p.city.toLowerCase())))))
    );

    if (approvedApp) {
      return {
        ...p,
        status: 'OCCUPIED',
        tenantName: approvedApp.applicantName || approvedApp.tenant?.full_name || 'Approved Tenant',
        leaseExpiry: approvedApp.moveInDate
          ? `Starting ${approvedApp.moveInDate}`
          : approvedApp.move_in_date
          ? `Starting ${approvedApp.move_in_date}`
          : 'Active Lease',
      };
    }
    return p;
  });
};

export const LandlordDashboard: React.FC<LandlordDashboardProps> = ({
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeNav, setActiveNav] = useState<'dashboard' | 'properties' | 'applications' | 'rent' | 'maintenance' | 'agreements' | 'messages' | 'settings'>('dashboard');
  const [revenueView, setRevenueView] = useState<'monthly' | 'quarterly'>('monthly');
  const [tenantFilter, setTenantFilter] = useState<'all' | 'current' | 'late'>('all');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [agreementsLoading, setAgreementsLoading] = useState(false);

  // Modals state
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [editingProperty, setEditingProperty] = useState<LandlordProperty | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notifications State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [landlordNotifications, setLandlordNotifications] = useState([
    {
      id: 1,
      title: 'New Maintenance Ticket',
      description: 'Balcony Solar Light Bulb Replacement reported for Sanepa 1BHK.',
      type: 'MAINTENANCE',
      time: 'Sep 8, 2026',
      unread: true,
      tab: 'maintenance',
      actionLabel: 'Dispatch Tech',
    },
    {
      id: 2,
      title: 'Plumbing Issue Reported',
      description: 'Bathroom Water Pressure Filter Check submitted for Shantinagar 2BHK.',
      type: 'MAINTENANCE',
      time: 'Sep 6, 2026',
      unread: false,
      tab: 'maintenance',
      actionLabel: 'View Ticket',
    },
    {
      id: 3,
      title: 'Tenant Application Approved',
      description: 'Aarav Sharma was approved for Cozy Room in Shared Apartment - Sanepa.',
      type: 'APPLICATION',
      time: 'Today',
      unread: false,
      tab: 'applications',
      actionLabel: 'View Details',
    },
  ]);

  // Applications Review Queue State (with localStorage cache support)
  const [applications, setApplications] = useState<LandlordApplication[]>(() => {
    const saved = localStorage.getItem('landlord_applications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_APPLICATIONS;
  });

  // Landlord Properties State (automatically synced with approved tenant applications)
  const [properties, setProperties] = useState<LandlordProperty[]>(() => {
    const savedProps = localStorage.getItem('landlord_managed_properties');
    let baseProps = INITIAL_PROPERTIES;
    if (savedProps) {
      try {
        baseProps = JSON.parse(savedProps);
      } catch (e) {}
    }
    const savedApps = localStorage.getItem('landlord_applications');
    let appsForSync = INITIAL_APPLICATIONS;
    if (savedApps) {
      try {
        appsForSync = JSON.parse(savedApps);
      } catch (e) {}
    }
    return syncPropertiesWithApplications(baseProps, appsForSync);
  });

  // Rent Collection Roster State
  const [rentPayments, setRentPayments] = useState([
    {
      id: 1,
      property: 'Shantinagar 2BHK - Subekshya Karki',
      dueDate: '1st of every month',
      amount: 25000,
      status: 'PAID',
      method: 'eSewa',
      overdueDays: 0,
    },
    {
      id: 2,
      property: 'Sanepa Unit #201 - Previous Tenant',
      dueDate: '5th of September 2026',
      amount: 14000,
      status: 'OVERDUE',
      method: 'Pending',
      overdueDays: 3,
    },
  ]);

  // Maintenance Dispatch State
  const [maintenanceFilter, setMaintenanceFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('landlord_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 104,
        unit: 'Shantinagar 2BHK',
        title: 'Bathroom Water Pressure Filter Check',
        category: 'PLUMBING',
        status: 'RESOLVED',
        date: 'Sep 6, 2026',
        assignedTo: 'Hari Technician (+977 9851000000)',
      },
      {
        id: 105,
        unit: 'Sanepa 1BHK',
        title: 'Balcony Solar Light Bulb Replacement',
        category: 'ELECTRICAL',
        status: 'RESOLVED',
        date: 'Sep 8, 2026',
        assignedTo: 'Unassigned',
      },
    ];
  });

  // Sync tickets with backend & local updates
  useEffect(() => {
    const fetchLatestTickets = async () => {
      try {
        const liveTickets = await maintenanceService.getTickets();
        if (Array.isArray(liveTickets) && liveTickets.length > 0) {
          const mapped: MaintenanceTicket[] = liveTickets.map((t) => ({
            id: t.id,
            unit: t.property_details?.title || 'Rental Property',
            title: t.title,
            category: t.category,
            status: t.status === 'SUBMITTED' ? 'OPEN' : (t.status as any),
            date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            assignedTo: t.assigned_technician || 'Unassigned',
          }));
          setTickets((prev) => {
            const mapById = new Map<number, MaintenanceTicket>();
            prev.forEach((item) => mapById.set(item.id, item));
            mapped.forEach((item) => {
              if (mapById.has(item.id)) {
                const existing = mapById.get(item.id)!;
                mapById.set(item.id, {
                  ...item,
                  assignedTo: existing.assignedTo && existing.assignedTo !== 'Unassigned'
                    ? existing.assignedTo
                    : item.assignedTo,
                });
              } else {
                mapById.set(item.id, item);
              }
            });
            const merged = Array.from(mapById.values());
            localStorage.setItem('landlord_tickets', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {}
    };

    fetchLatestTickets();

    const handleSync = () => {
      fetchLatestTickets();
    };
    window.addEventListener('maintenance:updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('maintenance:updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  useEffect(() => {
    const fetchAgreements = async () => {
      setAgreementsLoading(true);
      try {
        setAgreements(await agreementService.getAgreements());
      } catch {
        setAgreements([]);
      } finally {
        setAgreementsLoading(false);
      }
    };

    fetchAgreements();
  }, []);

  // Landlord Repair Ticket Creation State
  const [showLogRepairModal, setShowLogRepairModal] = useState(false);
  const [repairUnit, setRepairUnit] = useState('');
  const [repairTitle, setRepairTitle] = useState('');
  const [repairCategory, setRepairCategory] = useState<'PLUMBING' | 'ELECTRICAL' | 'APPLIANCE' | 'STRUCTURAL' | 'INTERNET' | 'OTHER'>('PLUMBING');
  const [repairTech, setRepairTech] = useState('');

  // Settings State
  const [bankName, setBankName] = useState(() => localStorage.getItem('landlord_bank_name') || 'Nabil Bank Ltd.');
  const [accountNumber, setAccountNumber] = useState(() => localStorage.getItem('landlord_account_num') || '02100175000000');
  const [accountHolder, setAccountHolder] = useState(() => localStorage.getItem('landlord_account_holder') || (user?.full_name || 'Landlord Owner'));
  const [walletId, setWalletId] = useState(() => localStorage.getItem('landlord_wallet_id') || '9851000000');
  const [autoReminders, setAutoReminders] = useState(() => localStorage.getItem('landlord_auto_reminders') !== 'false');

  const [reminderSentId, setReminderSentId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Attempt to fetch listings and applications from backend API on mount
  useEffect(() => {
    const fetchData = async () => {
      let currentApps = applications;
      let currentProps = properties;

      // 1. Fetch live applications from backend if available
      try {
        const backendApps = await applicationService.getApplications();
        if (backendApps && backendApps.length > 0) {
          const mappedApps = backendApps.map((a: any) => ({
            id: a.id,
            applicantName:
              a.tenant?.full_name ||
              `${a.tenant?.first_name || ''} ${a.tenant?.last_name || ''}`.trim() ||
              a.tenant?.email ||
              'Applicant',
            email: a.tenant?.email || '',
            property: a.property_details?.title || `Property #${a.property}`,
            propertyId: a.property_details?.id || a.property,
            monthlyIncome: Number(a.monthly_income) || 50000,
            occupation: a.employment_status || 'Employed',
            moveInDate: a.move_in_date || 'Immediate',
            status: a.status || 'PENDING',
            creditScore: a.credit_score_range || 'Verified',
          }));
          currentApps = mappedApps;
          setApplications(mappedApps);
        }
      } catch (err) {}

      // 2. Fetch live listings from backend if available
      try {
        const data = await propertyService.getMyListings();
        if (data && data.length > 0) {
          const mapped: LandlordProperty[] = data.map((p: any) => {
            const isRented =
              (p.status as string) === 'RENTED' || (p.status as string) === 'OCCUPIED';
            return {
              id: p.id,
              title: p.title,
              city: p.city,
              area: p.area,
              rent: Number(p.monthly_rent) || 0,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              status: isRented ? 'OCCUPIED' : 'VACANT',
              tenantName: p.current_tenant || (isRented ? 'Active Tenant' : 'None'),
              leaseExpiry: p.lease_expiry || (isRented ? 'Active Lease' : 'Immediate Move-in'),
              image:
                p.primary_image ||
                (p.images && p.images[0]?.image) ||
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
            };
          });
          currentProps = mapped;
        }
      } catch (err) {}

      // 3. Auto-sync properties with approved applications
      setProperties((prev) => {
        const base = currentProps.length > 0 ? currentProps : prev;
        const synced = syncPropertiesWithApplications(base, currentApps);
        localStorage.setItem('landlord_managed_properties', JSON.stringify(synced));
        return synced;
      });
    };

    fetchData();
  }, []);

  const userDisplayName =
    user?.full_name?.trim() ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'User';

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Property Handlers
  const handleListingCreated = (newProp: Property) => {
    const item: LandlordProperty = {
      id: newProp.id,
      title: newProp.title,
      city: newProp.city,
      area: newProp.area,
      rent: Number(newProp.monthly_rent) || 0,
      bedrooms: newProp.bedrooms,
      bathrooms: newProp.bathrooms,
      status: 'VACANT',
      tenantName: 'None',
      leaseExpiry: 'Immediate Move-in',
      image: newProp.primary_image || (newProp.images && newProp.images[0]?.image) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
    };
    setProperties((prev) => {
      const updated = [item, ...prev];
      localStorage.setItem('landlord_managed_properties', JSON.stringify(updated));
      return updated;
    });
    showToast(`Property "${newProp.title}" listed successfully!`);
  };

  const handleToggleStatus = (id: number) => {
    setProperties((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const next = p.status === 'OCCUPIED' ? 'VACANT' : 'OCCUPIED';
          showToast(`Unit marked as ${next}!`);

          // Check if there is an approved applicant for this property
          const approvedApp = applications.find(
            (a) =>
              a.status === 'APPROVED' &&
              ((a.propertyId && a.propertyId === p.id) ||
                (typeof a.property === 'string' &&
                  (a.property.toLowerCase().includes(p.title.toLowerCase()) ||
                    p.title.toLowerCase().includes(a.property.toLowerCase()))))
          );

          const newTenant =
            next === 'OCCUPIED'
              ? approvedApp?.applicantName || (p.tenantName !== 'None' ? p.tenantName : 'Active Tenant')
              : 'None';
          const newLease =
            next === 'OCCUPIED'
              ? approvedApp
                ? `Starting ${approvedApp.moveInDate}`
                : p.leaseExpiry !== 'Immediate Move-in'
                ? p.leaseExpiry
                : 'Active Lease'
              : 'Immediate Move-in';

          try {
            propertyService.updateProperty(p.id, {
              status: next === 'OCCUPIED' ? 'RENTED' : 'ACTIVE',
            }).catch(() => {});
          } catch (err) {}

          return {
            ...p,
            status: next,
            tenantName: newTenant,
            leaseExpiry: newLease,
          };
        }
        return p;
      });
      localStorage.setItem('landlord_managed_properties', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveEditProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    try {
      await propertyService.updateProperty(editingProperty.id, {
        title: editingProperty.title,
        monthly_rent: editingProperty.rent,
        status: editingProperty.status === 'OCCUPIED' ? 'RENTED' : 'ACTIVE',
      });
    } catch (err) {}
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === editingProperty.id ? editingProperty : p));
      localStorage.setItem('landlord_managed_properties', JSON.stringify(updated));
      return updated;
    });
    showToast(`Listing updated successfully!`);
    setEditingProperty(null);
  };

  const handleDeleteProperty = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this property listing?')) return;
    try {
      await propertyService.deleteProperty(id);
    } catch (err) {}
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('landlord_managed_properties', JSON.stringify(updated));
      return updated;
    });
    showToast('Listing removed.');
    setEditingProperty(null);
  };

  // Application Handlers
  const handleApproveApp = async (appId: number) => {
    try {
      await applicationService.updateStatus(appId, { status: 'APPROVED' });
    } catch (e) {}

    let approvedAppInfo: any = null;

    const updatedApps = applications.map((a) => {
      if (a.id === appId) {
        approvedAppInfo = { ...a, status: 'APPROVED' as const };
        return approvedAppInfo;
      }
      return a;
    });

    setApplications(updatedApps);
    localStorage.setItem('landlord_applications', JSON.stringify(updatedApps));

    if (approvedAppInfo) {
      setProperties((prev) => {
        const updatedProps = prev.map((p) => {
          const isMatch =
            (approvedAppInfo.propertyId && p.id === approvedAppInfo.propertyId) ||
            (approvedAppInfo.property_details?.id && p.id === approvedAppInfo.property_details.id) ||
            (typeof approvedAppInfo.property === 'string' &&
              (approvedAppInfo.property.toLowerCase().includes(p.title.toLowerCase()) ||
                p.title.toLowerCase().includes(approvedAppInfo.property.toLowerCase()) ||
                (approvedAppInfo.property.toLowerCase().includes(p.area.toLowerCase()) &&
                  approvedAppInfo.property.toLowerCase().includes(p.city.toLowerCase()))));

          if (isMatch) {
            try {
              propertyService.updateProperty(p.id, { status: 'RENTED' }).catch(() => {});
            } catch (err) {}

            return {
              ...p,
              status: 'OCCUPIED' as const,
              tenantName: approvedAppInfo.applicantName,
              leaseExpiry: approvedAppInfo.moveInDate
                ? `Starting ${approvedAppInfo.moveInDate}`
                : 'Active Lease',
            };
          }
          return p;
        });

        localStorage.setItem('landlord_managed_properties', JSON.stringify(updatedProps));
        return updatedProps;
      });

      // Also add or update rent collection roster for this approved tenant
      setRentPayments((prev) => {
        const exists = prev.some((r) =>
          r.property.toLowerCase().includes(approvedAppInfo.applicantName.toLowerCase())
        );
        if (exists) return prev;
        const matchingProp = properties.find((p) =>
          approvedAppInfo.propertyId
            ? p.id === approvedAppInfo.propertyId
            : approvedAppInfo.property.includes(p.title)
        );
        return [
          {
            id: Date.now(),
            property: `${matchingProp?.title || approvedAppInfo.property} - ${approvedAppInfo.applicantName}`,
            dueDate: '1st of every month',
            amount: matchingProp?.rent || 14000,
            status: 'PENDING' as const,
            method: 'Pending eSewa/Bank',
            overdueDays: 0,
          },
          ...prev,
        ];
      });

      showToast(`Tenant ${approvedAppInfo.applicantName} approved! Unit is now marked as OCCUPIED.`);
    } else {
      showToast('Tenant application approved! Notification sent.');
    }
  };

  const handleRejectApp = async (appId: number) => {
    try {
      await applicationService.updateStatus(appId, { status: 'REJECTED' });
    } catch (e) {}

    const rejectedApp = applications.find((a) => a.id === appId);

    const updatedApps = applications.map((a) =>
      a.id === appId ? { ...a, status: 'REJECTED' as const } : a
    );
    setApplications(updatedApps);
    localStorage.setItem('landlord_applications', JSON.stringify(updatedApps));

    if (rejectedApp) {
      setProperties((prev) => {
        const updatedProps = prev.map((p) => {
          if (p.tenantName === rejectedApp.applicantName) {
            return {
              ...p,
              status: 'VACANT' as const,
              tenantName: 'None',
              leaseExpiry: 'Immediate Move-in',
            };
          }
          return p;
        });
        localStorage.setItem('landlord_managed_properties', JSON.stringify(updatedProps));
        return updatedProps;
      });
    }

    showToast('Application rejected.');
  };

  // Rent Handlers
  const handleSendReminder = (id: number) => {
    setReminderSentId(id);
    showToast('SMS & Email payment reminder sent to tenant!');
    setTimeout(() => setReminderSentId(null), 3500);
  };

  const handleRecordPayment = (id: number) => {
    setRentPayments((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'PAID', method: 'Cash / Bank Deposit' } : r))
    );
    showToast('Payment recorded as PAID!');
  };

  const handleDownloadReceipt = (payment: any) => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rent Receipt - ${payment.property}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; }
              .header { border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 24px; }
              .title { color: #ea580c; font-size: 24px; font-weight: bold; margin: 0; }
              .receipt-no { font-size: 12px; color: #64748b; margin-top: 4px; }
              .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .details-table td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
              .label { color: #64748b; font-weight: 500; }
              .value { font-weight: bold; text-align: right; }
              .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #dcfce7; color: #15803d; font-weight: bold; font-size: 12px; }
              .footer { margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">RoomMateHub</h1>
              <div class="receipt-no">OFFICIAL RENT RECEIPT • #${payment.id}2026-SEP</div>
            </div>
            <table class="details-table">
              <tr>
                <td class="label">Date:</td>
                <td class="value">${new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td class="label">Unit / Tenant:</td>
                <td class="value">${payment.property}</td>
              </tr>
              <tr>
                <td class="label">Amount Paid:</td>
                <td class="value">Rs. ${payment.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="label">Payment Channel:</td>
                <td class="value">${payment.method}</td>
              </tr>
              <tr>
                <td class="label">Status:</td>
                <td class="value"><span class="badge">PAID IN FULL</span></td>
              </tr>
              <tr>
                <td class="label">Landlord:</td>
                <td class="value">${userDisplayName}</td>
              </tr>
            </table>
            <div class="footer">
              This receipt was digitally certified by RoomMateHub Rental Services.
            </div>
          </body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  };

  // Maintenance Handlers
  const handleTicketStatusCycle = async (id: number) => {
    const target = tickets.find((t) => t.id === id);
    if (!target) return;

    let newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' = 'OPEN';
    if (target.status === 'OPEN' || target.status === 'SUBMITTED') {
      newStatus = 'IN_PROGRESS';
    } else if (target.status === 'IN_PROGRESS') {
      newStatus = 'RESOLVED';
    } else {
      // If already RESOLVED, remove it
      handleRemoveTicket(id);
      return;
    }

    // 1. Update state and localStorage
    const updated = tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTickets(updated);
    localStorage.setItem('landlord_tickets', JSON.stringify(updated));

    // 2. Call backend API to persist the update
    try {
      await maintenanceService.updateTicketStatus(id, {
        status: newStatus === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS',
        resolution_notes: newStatus === 'RESOLVED' ? 'Issue inspected and repaired by technician.' : undefined,
      });
    } catch (e) {
      console.warn('Backend ticket status update sync:', e);
    }

    // 3. Dispatch real-time event for tenant dashboard
    window.dispatchEvent(
      new CustomEvent('maintenance:updated', {
        detail: { id, status: newStatus, resolution_notes: 'Issue inspected and repaired by technician.' },
      })
    );

    if (newStatus === 'RESOLVED') {
      showToast(`Ticket #${id} marked as RESOLVED and moved to resolved archive!`);
    } else {
      showToast(`Ticket #${id} marked as IN_PROGRESS!`);
    }
  };

  const handleRemoveTicket = async (id: number) => {
    const updated = tickets.filter((t) => t.id !== id);
    setTickets(updated);
    localStorage.setItem('landlord_tickets', JSON.stringify(updated));

    try {
      await api.delete(`/api/maintenance/${id}/`);
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('maintenance:updated', { detail: { id, removed: true } }));
    showToast('Maintenance request removed.');
  };

  const handleClearAllResolved = async () => {
    const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED');
    const updated = tickets.filter((t) => t.status !== 'RESOLVED');
    setTickets(updated);
    localStorage.setItem('landlord_tickets', JSON.stringify(updated));

    for (const t of resolvedTickets) {
      try {
        await api.delete(`/api/maintenance/${t.id}/`);
      } catch (e) {}
    }

    window.dispatchEvent(new CustomEvent('maintenance:updated', { detail: { clearedResolved: true } }));
    showToast('All resolved maintenance tickets cleared!');
  };

  const handleAssignTech = async (ticketId: number) => {
    const name = window.prompt('Enter Technician Name and Phone (e.g. Ramesh Plumbing +977 9841234567):');
    if (name && name.trim()) {
      const assignedTo = name.trim();
      setTickets((prev) => {
        const updated = prev.map((t) => (t.id === ticketId ? { ...t, assignedTo, status: 'IN_PROGRESS' } : t));
        localStorage.setItem('landlord_tickets', JSON.stringify(updated));
        return updated;
      });
      try {
        await maintenanceService.updateTicketStatus(ticketId, {
          status: 'IN_PROGRESS',
          assigned_technician: assignedTo,
        });
        showToast(`Technician ${assignedTo} assigned to Ticket #${ticketId}.`);
      } catch {
        showToast('Technician assignment could not be saved.');
      }
    }
  };

  const handleCreateRepairTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairTitle.trim()) return;

    const unitName = repairUnit.trim() || (properties.length > 0 ? properties[0].title : 'Rental Unit');
    const newTicket: MaintenanceTicket = {
      id: Date.now(),
      unit: unitName,
      title: repairTitle.trim(),
      category: repairCategory,
      status: 'OPEN',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedTo: repairTech.trim() || 'Unassigned',
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem('landlord_tickets', JSON.stringify(updated));

    // Also add to notifications
    setLandlordNotifications((prev) => [
      {
        id: Date.now(),
        title: 'New Maintenance Logged',
        description: `Repair registered: ${repairTitle.trim()} for ${unitName}`,
        type: 'MAINTENANCE',
        time: 'Just now',
        unread: true,
        tab: 'maintenance',
        actionLabel: 'Dispatch Tech',
      },
      ...prev,
    ]);

    setShowLogRepairModal(false);
    setRepairTitle('');
    setRepairTech('');
    showToast(`Repair request logged for ${unitName}!`);
  };

  // Open the backend-rendered agreement so printing uses live legal data.
  const handleDownloadAgreement = async (agreementId: number) => {
    const win = window.open('', '_blank');
    if (!win) return;

    try {
      const response = await api.get<string>(agreementService.getHtmlUrl(agreementId), {
        responseType: 'text',
      });
      win.document.open();
      win.document.write(response.data);
      win.document.close();
      win.focus();
      win.onload = () => win.print();
    } catch {
      win.close();
      showToast('Unable to load the agreement for printing.');
    }
  };

  // Settings Save Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('landlord_bank_name', bankName);
    localStorage.setItem('landlord_account_num', accountNumber);
    localStorage.setItem('landlord_account_holder', accountHolder);
    localStorage.setItem('landlord_wallet_id', walletId);
    localStorage.setItem('landlord_auto_reminders', String(autoReminders));
    showToast('Payout & billing preferences saved successfully!');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'properties', label: 'My Properties', icon: Home, badge: properties.length },
    {
      id: 'applications',
      label: 'Tenant Applications',
      icon: ClipboardList,
      badge: applications.filter((a) => a.status === 'PENDING').length,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'rent', label: 'Rent Collection', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance Dispatch', icon: Wrench, badge: `${tickets.filter((t) => t.status !== 'RESOLVED').length} Open` },
    { id: 'agreements', label: 'Lease Agreements', icon: FileText },
    { id: 'messages', label: 'Tenant Messages', icon: MessageSquare },
    { id: 'settings', label: 'Payout & Settings', icon: Settings },
  ];

  // Dashboard computed values
  const monthlyIncome = properties.reduce((sum, p) => (p.status === 'OCCUPIED' ? sum + Number(p.rent) : sum), 0);
  const occupiedCount = properties.filter((p) => p.status === 'OCCUPIED').length;
  const vacantCount = properties.filter((p) => p.status === 'VACANT').length;
  const pendingAppsCount = applications.filter((a) => a.status === 'PENDING').length;
  const openTicketsCount = tickets.filter((t) => t.status !== 'RESOLVED').length;

  // Revenue chart data (monthly last 6 months)
  const monthlyRevData = [
    { label: 'Apr', value: monthlyIncome * 0.92 },
    { label: 'May', value: monthlyIncome * 0.92 },
    { label: 'Jun', value: monthlyIncome },
    { label: 'Jul', value: monthlyIncome },
    { label: 'Aug', value: monthlyIncome },
    { label: 'Sep', value: monthlyIncome },
  ];
  const quarterlyRevData = [
    { label: 'Q1 2026', value: monthlyIncome * 0.92 * 3 },
    { label: 'Q2 2026', value: monthlyIncome * 2.95 },
    { label: 'Q3 2026', value: monthlyIncome * 3 },
  ];
  const revData = revenueView === 'monthly' ? monthlyRevData : quarterlyRevData;
  const revMax = Math.max(...revData.map((d) => d.value), 1);
  const totalYTD = revData.reduce((s, d) => s + d.value, 0);
  const avgMonthly = monthlyIncome;

  // Tenant roster for dashboard table
  const tenantRoster = properties
    .filter((p) => p.status === 'OCCUPIED' && p.tenantName && p.tenantName !== 'None')
    .map((p, idx) => ({
      id: p.id,
      name: p.tenantName,
      unit: `${String.fromCharCode(65 + idx)}1 – ${p.title.split(' ').slice(0, 3).join(' ')}`,
      lease: p.leaseExpiry,
      rent: p.rent,
      payment: rentPayments.find((r) => r.property.toLowerCase().includes(p.tenantName.toLowerCase()))?.status || 'PENDING',
      status: 'Current',
      image: `https://images.unsplash.com/photo-${idx === 0 ? '1539571696357-5a69c17a67c6' : idx === 1 ? '1494790108377-be9c29b29330' : '1500648767791-00dcc994a43e'}?w=80&auto=format&fit=crop&q=80`,
    }));

  const filteredTenants = tenantRoster.filter((t) => {
    if (tenantFilter === 'current') return t.payment === 'PAID';
    if (tenantFilter === 'late') return t.payment === 'OVERDUE' || t.payment === 'PENDING';
    return true;
  });

  const visibleApplications = applications.filter((application) => {
    const applicationPropertyId = application.propertyId || application.property_details?.id;
    const hasExecutedAgreement = agreements.some(
      (agreement) =>
        agreement.status === 'EXECUTED' &&
        agreement.property === applicationPropertyId &&
        agreement.tenant.email === application.email
    );
    return !hasExecutedAgreement;
  });

  return (
    <div className="landlord-dash-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="landlord-toast">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. DESKTOP SIDEBAR (Amber/Orange Brand) */}
      <aside className="landlord-dash-sidebar">
        <div>
          {/* Brand */}
          <div className="landlord-dash-brand">
            <div className="landlord-dash-brand-icon">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="landlord-dash-brand-title">RoomMateHub</span>
              <span className="landlord-dash-brand-sub">Property Owner Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="landlord-dash-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as any)}
                  className={`landlord-dash-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="landlord-dash-nav-left">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'landlord-dash-badge'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div>
          <button
            onClick={() => logout()}
            className="landlord-dash-nav-item !text-rose-400 hover:!text-rose-300 hover:!bg-rose-950/40"
          >
            <div className="landlord-dash-nav-left">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </div>
          </button>

        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="landlord-mobile-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="landlord-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="landlord-dash-brand-icon">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">RoomMateHub</span>
                    <span className="text-[10px] text-amber-400 font-semibold">Owner Portal</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id as any);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE */}
      <div className="landlord-dash-main">
        {/* Top Header */}
        <header className="landlord-dash-header">
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="landlord-mobile-toggle"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>

          {/* Right Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {landlordNotifications.some((n) => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn"
                  onMouseLeave={() => setNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                      {landlordNotifications.filter((n) => n.unread).length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          {landlordNotifications.filter((n) => n.unread).length} new
                        </span>
                      )}
                    </div>
                    {landlordNotifications.some((n) => n.unread) && (
                      <button
                        onClick={() =>
                          setLandlordNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                        }
                        className="text-[11px] font-semibold text-amber-600 hover:text-amber-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="py-2 space-y-2 max-h-80 overflow-y-auto">
                    {landlordNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.tab) setActiveNav(notif.tab as any);
                          setNotificationsOpen(false);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 ${
                          notif.unread
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/40'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 mt-0.5 shrink-0">
                          {notif.type === 'MAINTENANCE' ? (
                            <Wrench className="w-3.5 h-3.5" />
                          ) : notif.type === 'APPLICATION' ? (
                            <ClipboardList className="w-3.5 h-3.5" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                            {notif.description}
                          </p>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 inline-block">
                            {notif.actionLabel} →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Chip */}
            <div className="relative">
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="landlord-profile-chip"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userDisplayName}
                    className="w-7 h-7 rounded-full object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getInitials(userDisplayName)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <span className="landlord-profile-name">{userDisplayName}</span>
                  <span className="landlord-profile-role">Landlord Owner</span>
                </div>
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{userDisplayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'landlord@example.com'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveNav('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-500" />
                    <span>Payout & Settings</span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE WORKSPACE BODY */}
        <div className="landlord-dash-body">

          {/* =====================================================================
              SUBVIEW 0: DASHBOARD OVERVIEW
             ===================================================================== */}
          {activeNav === 'dashboard' && (
            <div className="ld-dashboard-view animate-fadeIn">

              {/* ---- KPI STATS ROW ---- */}
              <div className="ld-kpi-grid">
                {/* Monthly Rental Income */}
                <div className="ld-kpi-card">
                  <span className="ld-kpi-label">MONTHLY RENTAL INCOME</span>
                  <p className="ld-kpi-value">
                    Rs. {monthlyIncome.toLocaleString()}
                  </p>
                  <span className="ld-kpi-sub text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 100% on-time this month
                  </span>
                </div>

                {/* Total Properties */}
                <div className="ld-kpi-card">
                  <span className="ld-kpi-label">TOTAL PROPERTIES</span>
                  <p className="ld-kpi-value">{properties.length} Units</p>
                  <span className="ld-kpi-sub">
                    {occupiedCount} Occupied, {vacantCount} Vacant
                  </span>
                </div>

                {/* Pending Applications */}
                <div className="ld-kpi-card">
                  <span className="ld-kpi-label">PENDING APPLICATIONS</span>
                  <p className="ld-kpi-value text-amber-600">{pendingAppsCount}</p>
                  <button
                    onClick={() => setActiveNav('applications')}
                    className="ld-kpi-link text-amber-600 dark:text-amber-400"
                  >
                    Review applicants →
                  </button>
                </div>

                {/* Open Maintenance */}
                <div className="ld-kpi-card">
                  <span className="ld-kpi-label">OPEN MAINTENANCE</span>
                  <p className="ld-kpi-value text-blue-600">{openTicketsCount} Active</p>
                  <button
                    onClick={() => setActiveNav('maintenance')}
                    className="ld-kpi-link text-blue-600 dark:text-blue-400"
                  >
                    Dispatch technicians →
                  </button>
                </div>
              </div>

              {/* ---- MAIN CONTENT: CHART + PROPERTIES PANEL ---- */}
              <div className="ld-dash-main-row">

                {/* Revenue Overview Card */}
                <div className="ld-revenue-card">
                  <div className="ld-revenue-header">
                    <div>
                      <h3 className="ld-revenue-title">Revenue Overview</h3>
                      <p className="ld-revenue-sub">Last {revenueView === 'monthly' ? '6 months' : '3 quarters'}</p>
                    </div>
                    <div className="ld-rev-toggle">
                      <button
                        onClick={() => setRevenueView('monthly')}
                        className={`ld-rev-toggle-btn ${revenueView === 'monthly' ? 'active' : ''}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setRevenueView('quarterly')}
                        className={`ld-rev-toggle-btn ${revenueView === 'quarterly' ? 'active' : ''}`}
                      >
                        Quarterly
                      </button>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="ld-bar-chart">
                    {revData.map((d, i) => {
                      const isLast = i === revData.length - 1;
                      const pct = revMax > 0 ? (d.value / revMax) * 100 : 0;
                      return (
                        <div key={d.label} className="ld-bar-col">
                          <span className="ld-bar-amount">
                            {d.value >= 1000 ? `Rs.${(d.value / 1000).toFixed(1)}k` : `Rs.${d.value}`}
                          </span>
                          <div className="ld-bar-track">
                            <div
                              className={`ld-bar-fill ${isLast ? 'active' : ''}`}
                              style={{ height: `${Math.max(pct, 6)}%` }}
                            />
                          </div>
                          <span className={`ld-bar-label ${isLast ? 'font-bold text-indigo-600' : ''}`}>
                            {d.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary stats */}
                  <div className="ld-revenue-stats">
                    <div className="ld-rev-stat">
                      <span className="ld-rev-stat-label">Total YTD</span>
                      <span className="ld-rev-stat-val">Rs. {totalYTD >= 1000 ? `${(totalYTD / 1000).toFixed(1)}k` : totalYTD.toFixed(0)}</span>
                    </div>
                    <div className="ld-rev-stat">
                      <span className="ld-rev-stat-label">Avg Monthly</span>
                      <span className="ld-rev-stat-val">Rs. {avgMonthly >= 1000 ? `${(avgMonthly / 1000).toFixed(1)}k` : avgMonthly.toLocaleString()}</span>
                    </div>
                    <div className="ld-rev-stat">
                      <span className="ld-rev-stat-label">YoY Growth</span>
                      <span className="ld-rev-stat-val text-emerald-600">+4.2%</span>
                    </div>
                  </div>
                </div>

                {/* Properties Summary Panel */}
                <div className="ld-properties-panel">
                  <div className="ld-panel-header">
                    <h3 className="ld-panel-title">Properties</h3>
                    <button
                      onClick={() => setActiveNav('properties')}
                      className="ld-panel-link"
                    >
                      Manage →
                    </button>
                  </div>

                  <div className="ld-prop-list">
                    {properties.slice(0, 4).map((p, idx) => {
                      const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
                      const occupancyPct = p.status === 'OCCUPIED' ? 100 : 50;
                      return (
                        <div key={p.id} className="ld-prop-row">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="ld-prop-thumb"
                          />
                          <div className="ld-prop-info">
                            <h4 className="ld-prop-name">{p.title.split(' ').slice(0, 4).join(' ')}</h4>
                            <p className="ld-prop-loc">{p.city}, {p.area.split(',')[0]}</p>
                            <div className="ld-prop-bar-row">
                              <div className="ld-prop-bar-track">
                                <div
                                  className="ld-prop-bar-fill"
                                  style={{ width: `${occupancyPct}%`, backgroundColor: colors[idx % colors.length] }}
                                />
                              </div>
                              <span className="ld-prop-units">
                                {p.status === 'OCCUPIED' ? '1/1' : '0/1'} units
                              </span>
                            </div>
                          </div>
                          <span className="ld-prop-rent">
                            Rs. {p.rent.toLocaleString()}/mo
                          </span>
                        </div>
                      );
                    })}
                    {properties.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        <Building className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No properties yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ---- TENANTS TABLE ---- */}
              <div className="ld-tenants-card">
                <div className="ld-tenants-header">
                  <h3 className="ld-tenants-title">Tenants</h3>
                  <div className="ld-tenant-filter">
                    {(['all', 'current', 'late'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setTenantFilter(f)}
                        className={`ld-tenant-filter-btn ${tenantFilter === f ? 'active' : ''}`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ld-tenant-table-wrap">
                  <table className="ld-tenant-table">
                    <thead>
                      <tr>
                        <th>TENANT</th>
                        <th>UNIT</th>
                        <th>LEASE</th>
                        <th>RENT</th>
                        <th>SEP PAYMENT</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.length > 0 ? filteredTenants.map((t) => (
                        <tr key={t.id} className="ld-tenant-row">
                          <td>
                            <div className="ld-tenant-name-cell">
                              <img src={t.image} alt={t.name} className="ld-tenant-avatar" />
                              <span className="ld-tenant-name">{t.name}</span>
                            </div>
                          </td>
                          <td className="ld-tenant-unit">{t.unit}</td>
                          <td className="ld-tenant-lease">{t.lease}</td>
                          <td className="ld-tenant-rent">Rs. {t.rent.toLocaleString()}</td>
                          <td>
                            <span className={`ld-pay-badge ${
                              t.payment === 'PAID' ? 'paid' : t.payment === 'OVERDUE' ? 'late' : 'pending'
                            }`}>
                              {t.payment === 'PAID' ? 'Paid' : t.payment === 'OVERDUE' ? 'Late' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <span className={`ld-status-badge ${
                              t.payment === 'PAID' ? 'current' : 'late'
                            }`}>
                              {t.payment === 'PAID' ? 'Current' : 'Late'}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            No tenants match this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Subview 1: Properties & Units */}
          {activeNav === 'properties' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
              {/* Stat KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Rental Income</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    Rs. {properties.reduce((sum, p) => (p.status === 'OCCUPIED' ? sum + Number(p.rent) : sum), 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> 100% on-time this month
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Properties</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{properties.length} Units</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {properties.filter((p) => p.status === 'OCCUPIED').length} Occupied,{' '}
                    {properties.filter((p) => p.status === 'VACANT').length} Vacant
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Applications</span>
                  <p className="text-xl font-black text-amber-600 mt-1">
                    {applications.filter((a) => a.status === 'PENDING').length}
                  </p>
                  <button
                    onClick={() => setActiveNav('applications')}
                    className="text-[10px] text-amber-600 hover:underline font-bold mt-1 block text-left"
                  >
                    Review applicants →
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Open Maintenance</span>
                  <p className="text-xl font-black text-blue-600 mt-1">
                    {tickets.filter((t) => t.status !== 'RESOLVED').length} Active
                  </p>
                  <button
                    onClick={() => setActiveNav('maintenance')}
                    className="text-[10px] text-blue-600 hover:underline font-bold mt-1 block text-left"
                  >
                    Dispatch technicians →
                  </button>
                </div>
              </div>

              {/* Property Listings Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    Managed Properties & Rental Units
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage rent, status, applications, and property details
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateListing(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Listing</span>
                </button>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative">
                        <img src={p.image} alt={p.title} className="w-full h-44 object-cover" />
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          title="Click to toggle status"
                          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold transition shadow-md ${
                            p.status === 'OCCUPIED'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-amber-500 text-white hover:bg-amber-600'
                          }`}
                        >
                          {p.status} (Click to toggle)
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-600">
                            Rs. {p.rent.toLocaleString()} /mo
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {p.bedrooms} Beds • {p.bathrooms} Baths
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {p.area}, {p.city}
                        </p>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="text-slate-400">Current Tenant:</span>{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{p.tenantName}</span>
                          <span className="text-slate-400 ml-3">Lease:</span>{' '}
                          <span className="font-medium text-slate-600 dark:text-slate-300">{p.leaseExpiry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                      <button
                        onClick={() => setEditingProperty(p)}
                        className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>
                      <button
                        onClick={() => setActiveNav('applications')}
                        className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold"
                      >
                        View Applications →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subview 2: Tenant Applications Queue */}
          {activeNav === 'applications' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                    <span>Tenant Applications Queue</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Review applicant income, creditworthiness, and approve or decline tenancy
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {visibleApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.applicantName}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Applied for:{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{app.property}</span>
                      </p>

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                        <span>💼 {app.occupation}</span>
                        <span>💰 Monthly Income: Rs. {app.monthlyIncome.toLocaleString()}</span>
                        <span>📅 Desired Move-in: {app.moveInDate}</span>
                      </div>
                    </div>

                    {app.status === 'PENDING' ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveApp(app.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          Approve Tenant
                        </button>
                        <button
                          onClick={() => handleRejectApp(app.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => setActiveNav('messages')}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700"
                          title="Message Applicant"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">Application Closed</span>
                        <button
                          onClick={() => setActiveNav('messages')}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subview 3: Rent Collection */}
          {activeNav === 'rent' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span>Rent Collection & Payouts</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Track rent payments from tenants and send automated reminder alerts
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Collection Roster</h3>
                  <span className="text-xs font-semibold text-slate-400">Total Due: Rs. 39,000</span>
                </div>

                <div className="space-y-3">
                  {rentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{p.property}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Due on: {p.dueDate}{' '}
                          {p.overdueDays > 0 && p.status !== 'PAID' && (
                            <span className="text-rose-500 font-bold ml-1">
                              • Overdue by {p.overdueDays} days
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Rs. {p.amount.toLocaleString()}
                        </span>

                        {p.status === 'PAID' ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-[10px]">
                              PAID ({p.method})
                            </span>
                            <button
                              onClick={() => handleDownloadReceipt(p)}
                              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                              title="Print Receipt"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRecordPayment(p.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                              Record as Paid
                            </button>
                            <button
                              onClick={() => handleSendReminder(p.id)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                              {reminderSentId === p.id ? 'Sent!' : 'Send Reminder'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subview 4: Maintenance */}
          {activeNav === 'maintenance' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-600" />
                    <span>Maintenance Requests Dispatch</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tenant reported repairs across your units. Resolved requests are removed from active dispatch or can be cleared.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={() => {
                      if (properties.length > 0 && !repairUnit) {
                        setRepairUnit(properties[0].title);
                      }
                      setShowLogRepairModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Repair Request</span>
                  </button>

                  {tickets.some((t) => t.status === 'RESOLVED') && (
                    <button
                      onClick={handleClearAllResolved}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Resolved ({tickets.filter((t) => t.status === 'RESOLVED').length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Maintenance Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs font-bold">
                <button
                  onClick={() => setMaintenanceFilter('active')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    maintenanceFilter === 'active'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Active Requests ({tickets.filter((t) => t.status !== 'RESOLVED').length})
                </button>
                <button
                  onClick={() => setMaintenanceFilter('resolved')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    maintenanceFilter === 'resolved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Resolved Archive ({tickets.filter((t) => t.status === 'RESOLVED').length})
                </button>
                <button
                  onClick={() => setMaintenanceFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    maintenanceFilter === 'all'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  All ({tickets.length})
                </button>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {(() => {
                  const filtered = tickets.filter((t) => {
                    if (maintenanceFilter === 'active') return t.status !== 'RESOLVED';
                    if (maintenanceFilter === 'resolved') return t.status === 'RESOLVED';
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {maintenanceFilter === 'active'
                            ? 'All Maintenance Requests Resolved! 🎉'
                            : maintenanceFilter === 'resolved'
                            ? 'No Resolved Requests in Archive'
                            : 'No Maintenance Requests'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                          {maintenanceFilter === 'active'
                            ? 'Great job! There are no pending repairs or maintenance issues across your rental units.'
                            : 'No maintenance records match this view.'}
                        </p>
                        {maintenanceFilter === 'active' && tickets.some((t) => t.status === 'RESOLVED') && (
                          <button
                            onClick={() => setMaintenanceFilter('resolved')}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline block mx-auto mt-2"
                          >
                            View Resolved Archive ({tickets.filter((t) => t.status === 'RESOLVED').length}) →
                          </button>
                        )}
                      </div>
                    );
                  }

                  return filtered.map((t) => (
                    <div
                      key={t.id}
                      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        t.status === 'RESOLVED'
                          ? 'border-emerald-200/60 dark:border-emerald-900/40 opacity-90'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[10px] font-bold">
                            {t.category}
                          </span>
                          {t.status === 'RESOLVED' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[10px] font-bold">
                              ✓ Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Property: {t.unit} • Reported {t.date}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Technician: {t.assignedTo}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleAssignTech(t.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            Assign Tech
                          </button>
                        )}

                        <button
                          onClick={() => handleTicketStatusCycle(t.id)}
                          title={t.status === 'RESOLVED' ? 'Click to remove from dispatch' : 'Click to advance status'}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {t.status} ↺
                        </button>

                        {/* Explicit Remove Ticket button */}
                        <button
                          onClick={() => handleRemoveTicket(t.id)}
                          title="Remove ticket"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Subview 5: Agreements */}
          {activeNav === 'agreements' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <span>Lease Agreements & Digital Signatures</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Active residential agreements signed between you and your tenants
                  </p>
                </div>
              </div>

              {agreementsLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading agreements...</div>
              ) : agreements.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  No agreements have been created yet.
                </div>
              ) : (
                agreements.map((agreement) => (
                  <div key={agreement.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{agreement.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Tenant: {agreement.tenant.full_name} • Rent: Rs. {Number(agreement.monthly_rent).toLocaleString()}/mo
                      </p>
                      <span className={`text-[10px] font-bold mt-1 inline-block ${agreement.status === 'EXECUTED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {agreement.status === 'EXECUTED' ? 'Both Parties Digitally Signed' : 'Awaiting Tenant Signature'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadAgreement(agreement.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Subview 6: Messages */}
          {activeNav === 'messages' && (
            <div className="h-[calc(100vh-9rem)] animate-fadeIn">
              <MessagesInboxSubview />
            </div>
          )}

          {/* Subview 7: Settings */}
          {activeNav === 'settings' && (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Landlord Payout Account Settings</h3>
                <p className="text-xs text-slate-400">Configure bank accounts or digital wallets to receive monthly rent.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    eSewa / Khalti Registered Number
                  </label>
                  <input
                    type="text"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="autoReminders"
                    checked={autoReminders}
                    onChange={(e) => setAutoReminders(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="autoReminders" className="text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                    Automatically send reminder SMS 3 days before rent due date
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-sm active:scale-95"
                  >
                    Save Payout Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* CREATE LISTING MODAL */}
      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onSuccess={handleListingCreated}
      />

      {/* EDIT LISTING MODAL */}
      {editingProperty && (
        <div className="landlord-modal-overlay" onClick={() => setEditingProperty(null)}>
          <div className="landlord-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Property Listing</h3>
              <button
                onClick={() => setEditingProperty(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProperty} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  value={editingProperty.title}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rent (Rs.)
                  </label>
                  <input
                    type="number"
                    value={editingProperty.rent}
                    onChange={(e) => setEditingProperty({ ...editingProperty, rent: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Occupancy Status
                  </label>
                  <select
                    value={editingProperty.status}
                    onChange={(e) =>
                      setEditingProperty({
                        ...editingProperty,
                        status: e.target.value,
                        tenantName: e.target.value === 'OCCUPIED' ? (editingProperty.tenantName === 'None' ? 'Active Tenant' : editingProperty.tenantName) : 'None',
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="VACANT">VACANT</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteProperty(editingProperty.id)}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Repair Request Modal */}
      {showLogRepairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Log Repair Request</h3>
                  <p className="text-xs text-slate-400">Register a maintenance ticket for your unit</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogRepairModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRepairTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Property / Unit
                </label>
                <select
                  value={repairUnit || (properties[0]?.title ?? '')}
                  onChange={(e) => setRepairUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title} ({p.area}, {p.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser thermostat failure or Water pipe leak"
                  value={repairTitle}
                  onChange={(e) => setRepairTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={repairCategory}
                    onChange={(e) => setRepairCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="PLUMBING">Plumbing & Water</option>
                    <option value="ELECTRICAL">Electrical & Wiring</option>
                    <option value="APPLIANCE">Appliances</option>
                    <option value="STRUCTURAL">Doors / Locks / Walls</option>
                    <option value="INTERNET">WiFi / Internet</option>
                    <option value="OTHER">Other Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Tech (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hari +977 9851000000"
                    value={repairTech}
                    onChange={(e) => setRepairTech(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogRepairModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
