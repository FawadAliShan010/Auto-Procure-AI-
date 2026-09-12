import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  RoutePath,
  UserProfile,
  PurchaseRequest,
  ToastMessage,
} from '../types/procurement';
import {
  CURRENT_USER,
  INITIAL_PURCHASE_REQUESTS,
} from '../data/mockProcurementData';
import { analyzePurchaseRequest } from '../services/procurementEngine';
import { useAuth } from './AuthContext';

interface ProcurementContextType {
  currentRoute: RoutePath;
  navigateTo: (route: RoutePath) => void;
  currentUser: UserProfile;
  switchUser: (user: UserProfile) => void;
  requests: PurchaseRequest[];
  activeDraft: Partial<PurchaseRequest>;
  updateDraft: (fields: Partial<PurchaseRequest>) => void;
  resetDraft: () => void;
  currentAnalysisPR: PurchaseRequest | null;
  setCurrentAnalysisPR: (pr: PurchaseRequest | null) => void;
  startAnalysisFlow: (draft: Partial<PurchaseRequest>) => void;
  approveAndSendToERP: (prId: string) => void;
  updateRequestStatus: (prId: string, status: PurchaseRequest['status'], note?: string) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  selectedRequestForModal: PurchaseRequest | null;
  setSelectedRequestForModal: (pr: PurchaseRequest | null) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Sync route with URL hash or default to dashboard
  const getInitialRoute = (): RoutePath => {
    const hash = window.location.hash.replace('#', '') as RoutePath;
    const validRoutes: RoutePath[] = [
      '/login',
      '/dashboard',
      '/submit',
      '/processing',
      '/analysis',
      '/decision',
      '/recommendation',
      '/requests',
      '/analytics',
      '/settings',
    ];
    return validRoutes.includes(hash) ? hash : '/dashboard';
  };

  const getInitialRequests = (): PurchaseRequest[] => {
    try {
      const stored = localStorage.getItem('autoprocure_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read autoprocure_requests from localStorage', e);
    }
    return INITIAL_PURCHASE_REQUESTS;
  };

  const { userProfile } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<RoutePath>(getInitialRoute);
  const [currentUser, setCurrentUser] = useState<UserProfile>(userProfile || CURRENT_USER);

  // Sync currentUser with authenticated Google user
  useEffect(() => {
    if (userProfile) {
      setCurrentUser(userProfile);
      setActiveDraft((prev) => ({
        ...prev,
        employeeName: userProfile.name,
      }));
    }
  }, [userProfile]);
  const [requests, setRequests] = useState<PurchaseRequest[]>(getInitialRequests);
  const [activeDraft, setActiveDraft] = useState<Partial<PurchaseRequest>>({
    employeeName: CURRENT_USER.name,
    department: 'IT / Technology',
    itemDescription: 'laptop charger 65w',
    quantity: 10,
    estimatedPrice: 25,
    requiredDate: '2025-09-20',
    additionalNotes: '',
  });

  // Keep localStorage in sync with requests
  useEffect(() => {
    try {
      localStorage.setItem('autoprocure_requests', JSON.stringify(requests));
    } catch (e) {
      console.warn('Could not persist autoprocure_requests to localStorage', e);
    }
  }, [requests]);

  const [currentAnalysisPR, setCurrentAnalysisPR] = useState<PurchaseRequest | null>(
    INITIAL_PURCHASE_REQUESTS[0]
  );
  const [selectedRequestForModal, setSelectedRequestForModal] = useState<PurchaseRequest | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as RoutePath;
      if (hash && hash !== currentRoute) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoute]);

  const navigateTo = (route: RoutePath) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = (title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveDraft((prev) => ({
      ...prev,
      employeeName: user.name,
      department: user.role === 'Procurement Team' ? 'IT / Technology' : 'Maintenance',
    }));
    addToast('Persona Switched', `Logged in as ${user.name} (${user.role})`, 'info');
  };

  const updateDraft = (fields: Partial<PurchaseRequest>) => {
    setActiveDraft((prev) => ({ ...prev, ...fields }));
  };

  const resetDraft = () => {
    setActiveDraft({
      employeeName: currentUser.name,
      department: 'IT / Technology',
      itemDescription: '',
      quantity: 1,
      estimatedPrice: 20,
      requiredDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      additionalNotes: '',
    });
  };

  const startAnalysisFlow = (draft: Partial<PurchaseRequest>) => {
    const prId = `PR-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const analysis = analyzePurchaseRequest(draft);

    const initialStatus: PurchaseRequest['status'] =
      analysis.decisionResult.decision === 'PROCEED' || analysis.decisionResult.decision === 'APPROVE'
        ? 'APPROVED'
        : analysis.decisionResult.decision === 'REDUCE'
        ? 'REDUCE'
        : analysis.decisionResult.decision === 'HOLD'
        ? 'ON_HOLD'
        : analysis.decisionResult.decision === 'EXPEDITE'
        ? 'EXPEDITED'
        : analysis.decisionResult.decision === 'INVESTIGATE'
        ? 'INVESTIGATE'
        : analysis.decisionResult.decision === 'REJECT' || analysis.decisionResult.decision === 'REJECTED'
        ? 'REJECTED'
        : 'PENDING_VALIDATION';

    const newPR: PurchaseRequest = {
      id: prId,
      employeeName: draft.employeeName || currentUser.name,
      department: draft.department || 'IT / Technology',
      itemDescription: draft.itemDescription || 'Requisition item',
      quantity: Number(draft.quantity) || 1,
      estimatedPrice: Number(draft.estimatedPrice) || 25,
      requiredDate: draft.requiredDate || '2025-09-30',
      additionalNotes: draft.additionalNotes || '',
      createdAt: 'Just now',
      status: initialStatus,
      gate1: analysis.gate1,
      gate2: analysis.gate2,
      gate3: analysis.gate3,
      gate4: analysis.gate4,
      decisionResult: analysis.decisionResult,
      erpSynced: false,
    };

    setCurrentAnalysisPR(newPR);
    // Prepend to requests so user sees it in recent list
    setRequests((prev) => [newPR, ...prev]);

    // Go to /processing route first
    navigateTo('/processing');
  };

  const approveAndSendToERP = (prId: string) => {
    const erpRef = `SAP-PO-${Math.floor(100000 + Math.random() * 900000)}`;
    setRequests((prev) =>
      prev.map((pr) => (pr.id === prId ? { ...pr, erpSynced: true, erpRefId: erpRef, status: 'APPROVED' } : pr))
    );
    if (currentAnalysisPR && currentAnalysisPR.id === prId) {
      setCurrentAnalysisPR({
        ...currentAnalysisPR,
        erpSynced: true,
        erpRefId: erpRef,
        status: 'APPROVED',
      });
    }
    addToast(
      'ERP Handshake Complete',
      `PO payload successfully committed to SAP S/4HANA (Ref: ${erpRef})`,
      'success'
    );
  };

  const updateRequestStatus = (prId: string, status: PurchaseRequest['status'], note?: string) => {
    setRequests((prev) =>
      prev.map((pr) => {
        if (pr.id === prId) {
          return {
            ...pr,
            status,
            additionalNotes: note
              ? pr.additionalNotes
                ? `${pr.additionalNotes} | [Audit: ${note}]`
                : `[Audit: ${note}]`
              : pr.additionalNotes,
          };
        }
        return pr;
      })
    );

    if (currentAnalysisPR && currentAnalysisPR.id === prId) {
      setCurrentAnalysisPR({
        ...currentAnalysisPR,
        status,
        additionalNotes: note
          ? currentAnalysisPR.additionalNotes
            ? `${currentAnalysisPR.additionalNotes} | [Audit: ${note}]`
            : `[Audit: ${note}]`
          : currentAnalysisPR.additionalNotes,
      });
    }
  };

  return (
    <ProcurementContext.Provider
      value={{
        currentRoute,
        navigateTo,
        currentUser,
        switchUser,
        requests,
        activeDraft,
        updateDraft,
        resetDraft,
        currentAnalysisPR,
        setCurrentAnalysisPR,
        startAnalysisFlow,
        approveAndSendToERP,
        updateRequestStatus,
        toasts,
        addToast,
        removeToast,
        selectedRequestForModal,
        setSelectedRequestForModal,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcure = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcure must be used within a ProcurementProvider');
  }
  return context;
};
