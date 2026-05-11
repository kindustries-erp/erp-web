import { useState, useEffect, useRef } from "react";
import { useT } from "@/core/i18n";
import {
  getPositionsPagedApi,
  createPositionApi,
  updatePositionApi,
  deletePositionApi,
  getDepartmentsApi,
  type Position,
  type Department,
  type CreatePositionDto,
} from "@/modules/hr/api/hrApi";
import { ChucVuView } from "@/modules/hr/components/ChucVuView";

// ── Form state ─────────────────────────────────────────────────────────────

interface PosForm {
  position_code: string;
  position_name: string;
  department_group: string;
  approval_level: string;
  department_id: string;
  is_active: boolean;
}

const emptyForm: PosForm = {
  position_code: "",
  position_name: "",
  department_group: "",
  approval_level: "",
  department_id: "",
  is_active: true,
};

function buildForm(p: Position): PosForm {
  return {
    position_code: p.position_code,
    position_name: p.position_name,
    department_group: p.department_group ?? "",
    approval_level: p.approval_level != null ? String(p.approval_level) : "",
    department_id: p.department_id ?? "",
    is_active: p.is_active,
  };
}

// ── Main component ─────────────────────────────────────────────────────────

export function ChucVu() {
  const t = useT();
  const [items, setItems] = useState<Position[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState<PosForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load departments once for dropdown
  useEffect(() => {
    getDepartmentsApi()
      .then(setDepts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData(page, pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  async function loadData(pg: number, ps: number, q: string) {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await getPositionsPagedApi({
        page: pg,
        pageSize: ps,
        search: q || undefined,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setFetchError(t("chucvu.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInput(value: string) {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    if (value === "") {
      setSearch("");
      setPage(1);
    } else {
      searchTimer.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 400);
    }
  }

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: Position) {
    setEditing(item);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setSaveError(null);
  }

  const setField = <K extends keyof PosForm>(k: K, v: PosForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.position_name.trim()) {
      setSaveError(t("chucvu.requiredName"));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const dto: CreatePositionDto = {
        position_code:
          form.position_code.trim() || (undefined as unknown as string),
        position_name: form.position_name.trim(),
        department_group: form.department_group.trim() || null,
        approval_level: form.approval_level
          ? parseInt(form.approval_level, 10)
          : null,
        department_id: form.department_id || null,
        is_active: form.is_active,
      };
      if (editing) {
        await updatePositionApi(editing.id, dto);
      } else {
        await createPositionApi(dto);
      }
      closeDrawer();
      const targetPage = editing ? page : 1;
      if (targetPage !== page) setPage(1);
      else loadData(page, pageSize, search);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(msg ?? t("chucvu.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePositionApi(deleteTarget.id);
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadData(page, pageSize, search);
      }
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const deptName = (id: string | null) =>
    id ? (depts.find((d) => d.id === id)?.department_name ?? id) : "—";

  const isDirty = !!form.position_name.trim() || !!form.position_code.trim();

  return (
    <ChucVuView
      {...{
        t,
        openNew,
        searchInput,
        handleSearchInput,
        items,
        loading,
        fetchError,
        deptName,
        openEdit,
        setDeleteTarget,
        page,
        pageSize,
        total,
        totalPages,
        setPage,
        handlePageSize,
        drawerOpen,
        closeDrawer,
        isDirty,
        editing,
        saving,
        handleSave,
        form,
        setField,
        depts,
        saveError,
        deleteTarget,
        deleting,
        handleDelete,
      }}
    />
  );
}
