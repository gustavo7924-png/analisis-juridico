import { useEffect, useState } from 'react';
import { EMPTY_PROFILE } from './data/presets';
import {
  CompanyProfile,
  FollowUpEntry,
  LegalAuditResult,
  SavedAuditRecord,
} from './types';
import { ActiveTab, TopBar } from './components/TopBar';
import { IntakeWizard } from './components/IntakeWizard';
import { MatrixViewer } from './components/MatrixViewer';
import { ProductsServicesAnalysis } from './components/ProductsServicesAnalysis';
import { SpecificConsultationPanel } from './components/SpecificConsultationPanel';
import { HistoryView } from './components/HistoryView';

const STORAGE_KEY = 'lexmatriz_colombia_audits_v1';

function loadSavedAudits(): SavedAuditRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('wizard');
  const [profile, setProfile] = useState<CompanyProfile>({ ...EMPTY_PROFILE });
  const [savedAudits, setSavedAudits] = useState<SavedAuditRecord[]>(() =>
    loadSavedAudits()
  );
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzingProducts, setIsAnalyzingProducts] = useState<boolean>(false);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAudits));
    } catch {
      // Ignorar errores de cuota de almacenamiento local
    }
  }, [savedAudits]);

  const activeAudit =
    savedAudits.find((item) => item.id === activeAuditId) ?? null;

  const handleSubmitAudit = async (profileToRun: CompanyProfile) => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profileToRun }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || 'No fue posible completar la auditoría normativa.'
        );
      }

      const newRecord: SavedAuditRecord = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `audit-${Date.now()}`,
        createdAt: new Date().toISOString(),
        profile: { ...profileToRun },
        result: data as LegalAuditResult,
        followUps: [],
      };

      setSavedAudits((prev) => [newRecord, ...prev]);
      setActiveAuditId(newRecord.id);
      setActiveTab('matrix');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error de conexión al generar la matriz legal.';
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskFollowUp = async (question: string) => {
    if (!activeAudit) return;
    setIsAskingFollowUp(true);
    setFollowUpError(null);

    try {
      const response = await fetch('/api/audit/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: activeAudit.profile,
          summary: activeAudit.result.resumenEjecutivo,
          question,
          history: activeAudit.followUps,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || 'No se pudo procesar la consulta legal específica.'
        );
      }

      const entry: FollowUpEntry = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `q-${Date.now()}`,
        question,
        answer: data.answer,
        createdAt: new Date().toISOString(),
      };

      setSavedAudits((prev) =>
        prev.map((item) =>
          item.id === activeAudit.id
            ? { ...item, followUps: [...item.followUps, entry] }
            : item
        )
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error de red al consultar normativa específica.';
      setFollowUpError(message);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const handleRunProductsAnalysis = async (productosServicios: string[]) => {
    if (!activeAudit) return;
    setIsAnalyzingProducts(true);
    setProductsError(null);

    try {
      const updatedProfile: CompanyProfile = {
        ...activeAudit.profile,
        productosServicios,
      };

      const response = await fetch('/api/audit/products-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: updatedProfile,
          productosServicios,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || 'No se pudo completar el análisis jurídico de productos y servicios.'
        );
      }

      setProfile(updatedProfile);
      setSavedAudits((prev) =>
        prev.map((item) =>
          item.id === activeAudit.id
            ? {
                ...item,
                profile: updatedProfile,
                result: {
                  ...item.result,
                  resumenClasificacionPortafolio:
                    data.resumenClasificacionPortafolio,
                  analisisProductosServicios: data.analisisProductosServicios,
                },
              }
            : item
        )
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error de conexión al analizar productos y servicios.';
      setProductsError(message);
    } finally {
      setIsAnalyzingProducts(false);
    }
  };

  const handleOpenRecord = (record: SavedAuditRecord) => {
    setProfile({ ...record.profile });
    setActiveAuditId(record.id);
    setActiveTab('matrix');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = (id: string) => {
    setSavedAudits((prev) => prev.filter((item) => item.id !== id));
    if (activeAuditId === id) {
      setActiveAuditId(null);
      if (activeTab === 'matrix' || activeTab === 'consultation') {
        setActiveTab('history');
      }
    }
  };

  const handlePrimaryAction = () => {
    if (activeAudit && activeTab !== 'wizard') {
      window.print();
      return;
    }
    setActiveTab('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F5] text-[#1C1917]">
      <TopBar
        activeTab={activeTab}
        hasAudit={Boolean(activeAudit)}
        historyCount={savedAudits.length}
        onSelectTab={setActiveTab}
        onPrimaryAction={handlePrimaryAction}
      />

      <main className="flex-1">
        {activeTab === 'wizard' && (
          <IntakeWizard
            profile={profile}
            isGenerating={isGenerating}
            errorMessage={generateError}
            onChangeProfile={setProfile}
            onSubmitAudit={handleSubmitAudit}
            onDismissError={() => setGenerateError(null)}
          />
        )}

        {activeTab === 'matrix' && activeAudit && (
          <MatrixViewer
            profile={activeAudit.profile}
            result={activeAudit.result}
            createdAt={activeAudit.createdAt}
            onEditProfile={() => {
              setProfile({ ...activeAudit.profile });
              setActiveTab('wizard');
            }}
            onGoToProducts={() => {
              setProductsError(null);
              setActiveTab('products');
            }}
            onGoToConsultation={() => setActiveTab('consultation')}
          />
        )}

        {activeTab === 'products' && activeAudit && (
          <ProductsServicesAnalysis
            key={activeAudit.id}
            profile={activeAudit.profile}
            result={activeAudit.result}
            isAnalyzing={isAnalyzingProducts}
            errorMessage={productsError}
            onRunDeepAnalysis={handleRunProductsAnalysis}
            onBackToMatrix={() => setActiveTab('matrix')}
          />
        )}

        {activeTab === 'consultation' && activeAudit && (
          <SpecificConsultationPanel
            profile={activeAudit.profile}
            result={activeAudit.result}
            followUps={activeAudit.followUps}
            isAsking={isAskingFollowUp}
            errorMessage={followUpError}
            onAskQuestion={handleAskFollowUp}
            onBackToMatrix={() => setActiveTab('matrix')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            records={savedAudits}
            activeAuditId={activeAuditId}
            onOpenRecord={handleOpenRecord}
            onDeleteRecord={handleDeleteRecord}
            onNewAudit={() => {
              setProfile({ ...EMPTY_PROFILE });
              setActiveTab('wizard');
            }}
          />
        )}
      </main>

      <footer className="no-print border-t border-[#E5E0D5] bg-[#FBF9F5] py-6">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 text-xs text-[#78716C]">
          <span>
            LexMatríz Colombia · Marco de referencia jurídica corporativa y cumplimiento
            normativo
          </span>
          <span>
            Herramienta de apoyo técnico. Verifique decisiones críticas con su asesor jurídico
            titular.
          </span>
        </div>
      </footer>
    </div>
  );
}
