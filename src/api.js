import { 
    initDemoData, 
    demoGetMembers, 
    demoAddMember, 
    demoUpdateMember, 
    demoGetContributions, 
    demoAddContribution, 
    demoGetStats 
} from './demoData.js';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

if (isDemoMode) {
    console.warn("⚠️ Running in DEMO MODE. Data is persisted in localStorage only.");
    initDemoData();
}

/**
 * Standardizes fetch error handling for the real backend
 */
const handleNativeResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'API Request failed');
    }
    return response.json();
};

export const apiGetMembers = async () => {
    if (isDemoMode) return demoGetMembers();
    const res = await fetch('/api/members');
    return handleNativeResponse(res);
};

export const apiAddMember = async (memberData) => {
    if (isDemoMode) return demoAddMember(memberData);
    const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
    });
    return handleNativeResponse(res);
};

export const apiUpdateMember = async (id, memberData) => {
    if (isDemoMode) return demoUpdateMember(id, memberData);
    const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
    });
    return handleNativeResponse(res);
};

export const apiGetContributions = async () => {
    if (isDemoMode) return demoGetContributions();
    const res = await fetch('/api/contributions');
    return handleNativeResponse(res);
};

export const apiAddContribution = async (contribData) => {
    if (isDemoMode) return demoAddContribution(contribData);
    const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contribData)
    });
    return handleNativeResponse(res);
};

export const apiGetStats = async () => {
    if (isDemoMode) return demoGetStats();
    const res = await fetch('/api/stats');
    return handleNativeResponse(res);
};
