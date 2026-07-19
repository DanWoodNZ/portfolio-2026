"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  checkIsAuthenticated,
  loginAdmin,
  logoutAdmin,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  saveProjectsOrder,
  getVisualFeedItems,
  saveVisualFeedItems,
  deleteVisualFeedItem,
  getHistoryPhotos,
  saveHistoryPhotos,
  getCareerItems,
  saveCareerItems,
  getEducationItems,
  saveEducationItems,
  HistoryPhotoItem,
  VisualFeedItem,
  CMSProject,
  HighlightItem,
  MediaGalleryItem,
  uploadToR2,
  isVideoUrl,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from "@/lib/cms";
import { CareerItem } from "@/data/projects";
import {
  Lock,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Database,
  ExternalLink,
  GripVertical,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText,
  Columns,
  Upload,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Copy,
  Globe,
  Type,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const DashedBorder = ({
  rx = 8,
  className = "text-white/20 group-hover:text-[#E5FE8D]",
}: {
  rx?: number;
  className?: string;
}) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none">
    <rect
      x="1"
      y="1"
      width="calc(100% - 2px)"
      height="calc(100% - 2px)"
      rx={rx}
      ry={rx}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="12 4"
      className={`transition-colors ${className}`}
    />
  </svg>
);

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"credentials" | "pin">("credentials");
  const [pin, setPin] = useState("");

  // Dashboard state
  const [projects, setProjects] = useState<CMSProject[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [visualFeed, setVisualFeed] = useState<VisualFeedItem[]>([]);
  const visualFeedRef = useRef(visualFeed);
  useEffect(() => {
    visualFeedRef.current = visualFeed;
  }, [visualFeed]);
  const [draggedFeedIdx, setDraggedFeedIdx] = useState<number | null>(null);

  // History & Career state
  const [historyPhotos, setHistoryPhotos] = useState<HistoryPhotoItem[]>([]);
  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [careerItems, setCareerItems] = useState<CareerItem[]>([]);
  const [draggedCareerIdx, setDraggedCareerIdx] = useState<number | null>(null);
  const [educationItems, setEducationItems] = useState<CareerItem[]>([]);
  const [draggedEduIdx, setDraggedEduIdx] = useState<number | null>(null);
  const [careerTab, setCareerTab] = useState<"career" | "education">("career");
  const [activeSection, setActiveSection] = useState<"projects" | "visual_feed" | "career" | "history">("projects");

  // CRUD Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formHighlights, setFormHighlights] = useState<string[]>([]);
  const [formThumbnail, setFormThumbnail] = useState<string>("/assets/misc/placeholder.jpg");
  const [formSections, setFormSections] = useState<any[]>([]);
  const [formMediaGallery, setFormMediaGallery] = useState<MediaGalleryItem[]>([]);
  const [draggedSecIdx, setDraggedSecIdx] = useState<number | null>(null);
  const [frozenPreviewSections, setFrozenPreviewSections] = useState<any[] | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState<string>("");
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
  const [editingFeedCaptionItem, setEditingFeedCaptionItem] = useState<VisualFeedItem | null>(null);
  const [feedCaptionInput, setFeedCaptionInput] = useState<string>("");

  // Password protection state
  const [formIsLocked, setFormIsLocked] = useState<boolean>(false);
  const [formPassword, setFormPassword] = useState<string>("");
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);
  const [quickLockProject, setQuickLockProject] = useState<CMSProject | null>(null);
  const [quickIsLocked, setQuickIsLocked] = useState<boolean>(false);
  const [quickPassword, setQuickPassword] = useState<string>("");
  const [showQuickPassword, setShowQuickPassword] = useState<boolean>(false);
  const [quickSaveLoading, setQuickSaveLoading] = useState<boolean>(false);

  // Split pane resizing and preview scale state
  const [panelWidth, setPanelWidth] = useState<number>(40); // percentage width of edit panel
  const [previewScale, setPreviewScale] = useState<number>(0.65);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const availableWidth = Math.max(300, previewContainerRef.current.clientWidth - 80); // 40px padding on each side
        const availableHeight = Math.max(300, previewContainerRef.current.clientHeight - 80); // 40px top/bottom padding
        const widthScale = availableWidth / 1440;
        const heightScale = availableHeight / 800; // baseline desktop height
        const scale = Math.min(1, Math.max(0.2, Math.min(widthScale, heightScale)));
        setPreviewScale(scale);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [panelWidth, isEditing]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(
        Math.max(20, startWidth + (deltaX / window.innerWidth) * 100),
        50
      );
      setPanelWidth(newWidth);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    setLoading(true);
    const authed = await checkIsAuthenticated();
    setIsAuthenticated(authed);
    if (authed) {
      await loadProjects();
    }
    setLoading(false);
  };

  const loadProjects = async () => {
    const list = await getProjects();
    setProjects(list);
    const feed = await getVisualFeedItems();
    setVisualFeed(feed);
    const photos = await getHistoryPhotos();
    setHistoryPhotos(photos);
    const career = await getCareerItems();
    setCareerItems(career);
    const edu = await getEducationItems();
    setEducationItems(edu);
  };

  const handleAddVisualFeedItem = async () => {
    const newId = `feed-${Date.now()}`;
    const aspectRatios = [
      "aspect-[4/5]",
      "aspect-[16/10]",
      "aspect-[1/1]",
      "aspect-[3/4]",
      "aspect-[4/3]",
      "aspect-[9/16]",
      "aspect-[16/9]",
    ];
    const randomAspect = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
    const newItem: VisualFeedItem = {
      id: newId,
      title: `VISUAL ASSET ${visualFeed.length + 1}`,
      aspectRatio: randomAspect,
      src: "/assets/misc/placeholder.jpg",
      order_index: visualFeed.length + 1,
    };
    const updated = [...visualFeed, newItem];
    setVisualFeed(updated);
    visualFeedRef.current = updated;
    const res = await saveVisualFeedItems(updated);
    if (!res.success && res.error) {
      showNotification("Error adding visual feed item: " + res.error);
    } else {
      showNotification("New visual feed item added!");
    }
    window.dispatchEvent(new Event("visual-feed-updated"));
  };

  const handleDeleteVisualFeedItem = async (id: string) => {
    const updated = visualFeed
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, order_index: idx + 1 }));
    setVisualFeed(updated);
    visualFeedRef.current = updated;
    await deleteVisualFeedItem(id);
    const res = await saveVisualFeedItems(updated);
    if (!res.success && res.error) {
      showNotification("Error saving after delete: " + res.error);
    } else {
      showNotification("Visual feed item deleted.");
    }
    window.dispatchEvent(new Event("visual-feed-updated"));
  };

  const handleSaveFeedCaption = async () => {
    if (!editingFeedCaptionItem) return;
    const updated = visualFeed.map((item) => {
      if (item.id === editingFeedCaptionItem.id) {
        return { ...item, title: feedCaptionInput };
      }
      return item;
    });
    setVisualFeed(updated);
    visualFeedRef.current = updated;
    const res = await saveVisualFeedItems(updated);
    if (!res.success && res.error) {
      showNotification("Error saving caption: " + res.error);
    } else {
      showNotification("Visual feed caption updated!");
    }
    window.dispatchEvent(new Event("visual-feed-updated"));
    setEditingFeedCaptionItem(null);
  };

  const handleFeedFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showNotification("Uploading to Cloudflare R2...");
      const { url } = await uploadToR2(file);
      const updated = visualFeed.map((item) => {
        if (item.id === id) {
          return { ...item, src: url };
        }
        return item;
      });
      setVisualFeed(updated);
      visualFeedRef.current = updated;
      const res = await saveVisualFeedItems(updated);
      if (!res.success && res.error) {
        showNotification("Upload succeeded but DB save failed: " + res.error);
      } else {
        showNotification("Visual feed item media updated!");
      }
      window.dispatchEvent(new Event("visual-feed-updated"));
    } catch (err: any) {
      showNotification("Upload failed: " + err.message);
    }
  };

  const handleFeedDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedFeedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFeedDragEnter = (e: React.DragEvent, hoverIdx: number) => {
    e.preventDefault();
    if (draggedFeedIdx === null || draggedFeedIdx === hoverIdx) return;
    const updated = [...visualFeed];
    const [moved] = updated.splice(draggedFeedIdx, 1);
    updated.splice(hoverIdx, 0, moved);
    updated.forEach((item, i) => {
      item.order_index = i + 1;
    });
    setVisualFeed(updated);
    visualFeedRef.current = updated;
    setDraggedFeedIdx(hoverIdx);
  };

  const handleFeedDrop = async () => {
    if (draggedFeedIdx === null) return;
    setDraggedFeedIdx(null);
    const toSave = visualFeedRef.current.length > 0 ? visualFeedRef.current : visualFeed;
    const res = await saveVisualFeedItems(toSave);
    if (!res.success && res.error) {
      showNotification("Error saving visual feed order: " + res.error);
    } else {
      showNotification("Visual feed order saved!");
    }
    window.dispatchEvent(new Event("visual-feed-updated"));
  };

  // --- HISTORY PHOTOS HANDLERS ---
  const handlePhotoDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedPhotoIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handlePhotoDragEnter = (e: React.DragEvent, hoverIdx: number) => {
    e.preventDefault();
    if (draggedPhotoIdx === null || draggedPhotoIdx === hoverIdx) return;
    const reordered = [...historyPhotos];
    const [draggedItem] = reordered.splice(draggedPhotoIdx, 1);
    reordered.splice(hoverIdx, 0, draggedItem);
    const reorderedWithOrder = reordered.map((item, i) => ({ ...item, order_index: i + 1 }));
    setHistoryPhotos(reorderedWithOrder);
    setDraggedPhotoIdx(hoverIdx);
  };
  const handlePhotoDrop = async () => {
    if (draggedPhotoIdx === null) return;
    setDraggedPhotoIdx(null);
    await saveHistoryPhotos(historyPhotos);
    showNotification("History photo order saved!");
  };
  const handleAddPhoto = async () => {
    const newPhoto: HistoryPhotoItem = {
      id: `hp-${Date.now()}`,
      src: "/assets/photos/dan-stage.webp",
      alt: "New Photo",
      order_index: historyPhotos.length + 1,
    };
    const updated = [...historyPhotos, newPhoto];
    setHistoryPhotos(updated);
    await saveHistoryPhotos(updated);
    showNotification("Added new photo!");
  };
  const handleRemovePhoto = async (id: string) => {
    const updated = historyPhotos.filter((p) => p.id !== id).map((p, i) => ({ ...p, order_index: i + 1 }));
    setHistoryPhotos(updated);
    await saveHistoryPhotos(updated);
    showNotification("Removed photo!");
  };
  const handleUpdatePhotoField = async (id: string, field: "src" | "alt", val: string) => {
    const updated = historyPhotos.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    setHistoryPhotos(updated);
    await saveHistoryPhotos(updated);
  };
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showNotification("Uploading history photo to Cloudflare R2...");
      const { url } = await uploadToR2(file);
      const updated = historyPhotos.map((p) => (p.id === id ? { ...p, src: url } : p));
      setHistoryPhotos(updated);
      await saveHistoryPhotos(updated);
      showNotification("History photo uploaded to R2!");
    } catch (err: any) {
      showNotification("Upload failed: " + err.message);
    }
  };

  // --- CAREER & EDUCATION HANDLERS ---
  const currentCareerList = careerTab === "career" ? careerItems : educationItems;
  const setCurrentCareerList = (updated: CareerItem[]) => {
    if (careerTab === "career") setCareerItems(updated);
    else setEducationItems(updated);
  };
  const saveCurrentCareerList = async (updated: CareerItem[]) => {
    if (careerTab === "career") await saveCareerItems(updated);
    else await saveEducationItems(updated);
  };
  const handleCareerDragStart = (e: React.DragEvent, idx: number) => {
    if (careerTab === "career") setDraggedCareerIdx(idx);
    else setDraggedEduIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleCareerDragEnter = (e: React.DragEvent, hoverIdx: number) => {
    e.preventDefault();
    const curIdx = careerTab === "career" ? draggedCareerIdx : draggedEduIdx;
    if (curIdx === null || curIdx === hoverIdx) return;
    const reordered = [...currentCareerList];
    const [draggedItem] = reordered.splice(curIdx, 1);
    reordered.splice(hoverIdx, 0, draggedItem);
    const reorderedWithOrder = reordered.map((item, i) => ({ ...item, order_index: i + 1 }));
    setCurrentCareerList(reorderedWithOrder);
    if (careerTab === "career") setDraggedCareerIdx(hoverIdx);
    else setDraggedEduIdx(hoverIdx);
  };
  const handleCareerDrop = async () => {
    const curIdx = careerTab === "career" ? draggedCareerIdx : draggedEduIdx;
    if (curIdx === null) return;
    if (careerTab === "career") setDraggedCareerIdx(null);
    else setDraggedEduIdx(null);
    await saveCurrentCareerList(currentCareerList);
    showNotification("Order saved!");
  };
  const handleAddCareerItem = async () => {
    const newItem: CareerItem = {
      id: `career-${Date.now()}`,
      company: careerTab === "career" ? "NEW COMPANY" : "NEW SCHOOL",
      role: careerTab === "career" ? "PRODUCT DESIGNER" : "DEGREE",
      year: new Date().getFullYear().toString(),
      isCurrent: false,
      order_index: currentCareerList.length + 1,
    };
    const updated = [...currentCareerList, newItem];
    setCurrentCareerList(updated);
    await saveCurrentCareerList(updated);
    showNotification("Added item!");
  };
  const handleRemoveCareerItem = async (id?: string, idx?: number) => {
    const updated = currentCareerList
      .filter((c, i) => (id ? c.id !== id : i !== idx))
      .map((c, i) => ({ ...c, order_index: i + 1 }));
    setCurrentCareerList(updated);
    await saveCurrentCareerList(updated);
    showNotification("Removed item!");
  };
  const handleUpdateCareerField = async (idx: number, field: keyof CareerItem, val: any) => {
    const updated = currentCareerList.map((c, i) => (i === idx ? { ...c, [field]: val } : c));
    setCurrentCareerList(updated);
    await saveCurrentCareerList(updated);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const res = await loginAdmin(email, password);
    if (res.success) {
      setIsAuthenticated(true);
      await loadProjects();
    } else {
      setLoginError(res.error || "Login failed");
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormRole("PRODUCT DESIGNER");
    const yr = new Date().getFullYear().toString();
    setFormYear(yr);
    const ord = projects.length + 1;
    setFormOrder(ord);
    setFormHighlights([""]);
    setFormSections([]);
    setFormMediaGallery([]);
    setFormIsLocked(false);
    setFormPassword("");
    setInitialFormSnapshot(
      JSON.stringify({
        title: "",
        description: "",
        role: "PRODUCT DESIGNER",
        year: yr,
        order: ord,
        highlights: [""],
        sections: [],
        is_locked: false,
        password: "",
      })
    );
    setIsEditing(true);
  };

  const openEditForm = (proj: CMSProject) => {
    setEditingId(proj.id);
    setFormTitle(proj.title);
    setFormDescription(proj.description);
    setFormRole(proj.role);
    setFormYear(proj.year);
    setFormOrder(proj.order_index);
    const hils = (proj.highlights || []).map((h: any) => (typeof h === "string" ? h : h?.text || ""));
    setFormHighlights(hils);
    setFormThumbnail(proj.thumbnail || "/assets/misc/placeholder.jpg");
    const secs = proj.sections ? JSON.parse(JSON.stringify(proj.sections)) : [];
    const gal = proj.media_gallery ? JSON.parse(JSON.stringify(proj.media_gallery)) : [];
    setFormSections(secs);
    setFormMediaGallery(gal);
    setFormIsLocked(!!proj.is_locked);
    setFormPassword(proj.password || "");
    setInitialFormSnapshot(
      JSON.stringify({
        title: proj.title,
        description: proj.description,
        role: proj.role,
        year: proj.year,
        order: proj.order_index,
        highlights: hils,
        thumbnail: proj.thumbnail || "/assets/misc/placeholder.jpg",
        sections: secs,
        media_gallery: gal,
        is_locked: !!proj.is_locked,
        password: proj.password || "",
      })
    );
    setIsEditing(true);
  };

  const handleBackClick = () => {
    const currentSnapshot = JSON.stringify({
      title: formTitle,
      description: formDescription,
      role: formRole,
      year: formYear,
      order: formOrder,
      highlights: formHighlights,
      thumbnail: formThumbnail,
      sections: formSections,
      media_gallery: formMediaGallery,
      is_locked: formIsLocked,
      password: formPassword,
    });
    if (currentSnapshot !== initialFormSnapshot) {
      setShowUnsavedModal(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleAddHighlightField = () => {
    if (formHighlights.length < 3) {
      setFormHighlights([...formHighlights, ""]);
    }
  };

  const handleRemoveHighlightField = (index: number) => {
    setFormHighlights(formHighlights.filter((_, i) => i !== index));
  };

  const handleHighlightChange = (index: number, val: string) => {
    const updated = [...formHighlights];
    updated[index] = val;
    setFormHighlights(updated);
  };

  // Section handlers
  const handleSectionDragStart = (e: React.DragEvent, idx: number) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.isContentEditable
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setDraggedSecIdx(idx);
    setFrozenPreviewSections([...formSections]);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSectionDragEnter = (e: React.DragEvent, hoverIdx: number) => {
    e.preventDefault();
    if (draggedSecIdx === null || draggedSecIdx === hoverIdx) return;
    const updated = [...formSections];
    const [moved] = updated.splice(draggedSecIdx, 1);
    updated.splice(hoverIdx, 0, moved);
    setFormSections(updated);
    setDraggedSecIdx(hoverIdx);
  };

  const handleSectionDrop = (targetIdx: number) => {
    if (draggedSecIdx === null || draggedSecIdx === targetIdx) {
      setDraggedSecIdx(null);
      setFrozenPreviewSections(null);
      return;
    }
    const updated = [...formSections];
    const [moved] = updated.splice(draggedSecIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setFormSections(updated);
    setDraggedSecIdx(null);
    setFrozenPreviewSections(null);
  };

  const handleShiftSection = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formSections.length) return;
    const updated = [...formSections];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setFormSections(updated);
  };

  const handleToggleHideSection = (idx: number) => {
    const updated = [...formSections];
    updated[idx] = { ...updated[idx], hidden: !updated[idx].hidden };
    setFormSections(updated);
  };

  const handleDuplicateSection = (idx: number) => {
    const updated = [...formSections];
    const toDup = JSON.parse(JSON.stringify(updated[idx]));
    toDup.id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    updated.splice(idx + 1, 0, toDup);
    setFormSections(updated);
  };

  const handleRemoveSection = (idx: number) => {
    if (window.confirm("Remove this section?")) {
      setFormSections(formSections.filter((_, i) => i !== idx));
    }
  };

  const handleSectionChange = (idx: number, updates: any) => {
    const updated = [...formSections];
    updated[idx] = { ...updated[idx], ...updates };
    setFormSections(updated);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showNotification("Uploading section media to Cloudflare R2...");
      const { url } = await uploadToR2(file);
      const updated = [...formSections];
      if (field === "image1") {
        updated[idx] = { ...updated[idx], image1: { ...updated[idx].image1, src: url } };
      } else if (field === "image2") {
        updated[idx] = { ...updated[idx], image2: { ...updated[idx].image2, src: url } };
      }
      setFormSections(updated);
      showNotification("Section media uploaded!");
    } catch (err: any) {
      showNotification("Upload failed: " + err.message);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showNotification("Uploading thumbnail to Cloudflare R2...");
      const { url } = await uploadToR2(file);
      const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
      setFormThumbnail(cleanUrl);
      showNotification("Thumbnail uploaded!");
    } catch (err: any) {
      showNotification("Upload failed: " + err.message);
    }
  };

  const handleGalleryMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showNotification("Uploading media to Cloudflare R2...");
      const { url, type } = await uploadToR2(file);
      const newItem: MediaGalleryItem = {
        id: `gal-${Date.now()}`,
        url,
        type,
        order_index: formMediaGallery.length + 1,
      };
      setFormMediaGallery([...formMediaGallery, newItem]);
      showNotification("Added R2 media to gallery!");
    } catch (err: any) {
      showNotification("Upload failed: " + err.message);
    }
  };

  const handleShiftGalleryItem = (idx: number, direction: "up" | "down") => {
    const updated = [...formMediaGallery];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormMediaGallery(updated.map((g, i) => ({ ...g, order_index: i + 1 })));
  };

  const handleRemoveGalleryItem = (idx: number) => {
    const updated = formMediaGallery.filter((_, i) => i !== idx).map((g, i) => ({ ...g, order_index: i + 1 }));
    setFormMediaGallery(updated);
  };

  const handleAddSection = (type: "full-width-image" | "description" | "two-column-image") => {
    const id = `sec-${Date.now()}`;
    let newSec: any = { id, type, hidden: false };
    if (type === "full-width-image") {
      newSec.image1 = { src: "", caption: "FULL WIDTH IMAGE CAPTION" };
    } else if (type === "description") {
      newSec.title = "New Section Title";
      newSec.content = "Write your section description text here...";
    } else if (type === "two-column-image") {
      newSec.image1 = { src: "", caption: "COLUMN 1 CAPTION" };
      newSec.image2 = { src: "", caption: "COLUMN 2 CAPTION" };
    }
    setFormSections([...formSections, newSec]);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    // Clean up highlights
    const cleanHighlights: HighlightItem[] = (formHighlights || [])
      .filter((text) => text && typeof text === "string" && text.trim() !== "")
      .map((text, i) => ({ id: `h-${Date.now()}-${i}`, text: (text || "").trim() }));

    const slug = formTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `proj-${Date.now()}`;

    if (editingId) {
      // Update
      const res = await updateProject(editingId, {
        title: formTitle,
        slug,
        description: formDescription,
        role: formRole,
        year: formYear,
        order_index: formOrder,
        highlights: cleanHighlights,
        thumbnail: formThumbnail,
        sections: formSections,
        media_gallery: formMediaGallery,
        is_locked: formIsLocked,
        password: formPassword,
      });
      if (!res.success) {
        setSaveLoading(false);
        showNotification(`Error saving changes: ${res.error || "Unknown error"}`);
        alert(`Failed to save changes:\n${res.error || "Unknown error"}`);
        return;
      }
      showNotification(res.warning || "Project updated successfully");
    } else {
      // Create new
      const res = await createProject({
        slug,
        title: formTitle,
        description: formDescription,
        role: formRole,
        year: formYear,
        order_index: formOrder,
        highlights: cleanHighlights,
        thumbnail: formThumbnail,
        sections: formSections,
        media_gallery: formMediaGallery,
        is_locked: formIsLocked,
        password: formPassword,
      });
      if (!res.success) {
        setSaveLoading(false);
        showNotification(`Error creating project: ${res.error || "Unknown error"}`);
        alert(`Failed to create project:\n${res.error || "Unknown error"}`);
        return;
      }
      showNotification(res.warning || "New project created successfully");
    }

    await loadProjects();
    window.dispatchEvent(new Event("projects-updated"));
    setShowUnsavedModal(false);
    setIsEditing(false);
    setSaveLoading(false);
  };

  const handleSaveQuickLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLockProject) return;
    setQuickSaveLoading(true);
    const res = await updateProject(quickLockProject.id, {
      is_locked: quickIsLocked,
      password: quickPassword,
    });
    if (!res.success) {
      setQuickSaveLoading(false);
      showNotification(`Error saving settings: ${res.error || "Unknown error"}`);
      alert(`Failed to save password settings:\n${res.error || "Unknown error"}`);
      return;
    }
    await loadProjects();
    window.dispatchEvent(new Event("projects-updated"));
    showNotification(res.warning || "Password protection settings saved");
    setQuickLockProject(null);
    setQuickSaveLoading(false);
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const res = await deleteProject(id);
      if (!res.success) {
        showNotification(`Error: ${res.error || "Failed to delete"}`);
        return;
      }
      await loadProjects();
      window.dispatchEvent(new Event("projects-updated"));
      showNotification("Project deleted");
    }
  };

  const handleAddDummyProject = async (slotOrder: number) => {
    setSaveLoading(true);
    const dummyTitle = `Project Case Study #${slotOrder}`;
    const slug = `project-case-study-${slotOrder}-${Date.now()}`;
    const dummyDescription = `This is a fresh starter template for Project #${slotOrder}. Use this space to describe the challenge, your design process, and the measurable business impact of your work.\n\nHelper tip: You can add up to 3 metric highlights above your content sections, and choose from Full-Width Image, Text Description, or Two-Column Image templates below to structure your case study.`;
    const dummyRole = "LEAD PRODUCT DESIGNER";
    const dummyYear = new Date().getFullYear().toString();
    const dummyHighlights: HighlightItem[] = [
      { id: `h-${Date.now()}-1`, text: "+24% increase in user conversion rate" },
      { id: `h-${Date.now()}-2`, text: "3.2x faster page load performance" },
      { id: `h-${Date.now()}-3`, text: "Adopted by 150k+ active daily users" },
    ];
    const dummySections: any[] = [
      {
        id: `sec-${Date.now()}-1`,
        type: "description",
        title: "01 / The Challenge & Strategic Vision",
        content:
          "Explain the background of the project here. What problem were you solving for the user or business? What were the key constraints and goals?",
        hidden: false,
      },
      {
        id: `sec-${Date.now()}-2`,
        type: "full-width-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "HERO UI OVERVIEW & SYSTEM ARCHITECTURE",
          hideCaption: false,
        },
        hidden: false,
      },
      {
        id: `sec-${Date.now()}-3`,
        type: "description",
        title: "02 / Design Exploration & Key Decisions",
        content:
          "Detail your design methodology. Did you conduct user interviews, build wireframes, or iterate on interactive prototypes? Document your decisions.",
        hidden: false,
      },
      {
        id: `sec-${Date.now()}-4`,
        type: "two-column-image",
        image1: {
          src: "/assets/misc/placeholder.jpg",
          caption: "EARLY PROTOTYPE EXPLORATION",
          hideCaption: false,
        },
        image2: {
          src: "/assets/misc/placeholder.jpg",
          caption: "FINAL POLISHED INTERFACE",
          hideCaption: false,
        },
        hidden: false,
      },
    ];

    const res = await createProject({
      slug,
      title: dummyTitle,
      description: dummyDescription,
      role: dummyRole,
      year: dummyYear,
      order_index: slotOrder,
      highlights: dummyHighlights,
      thumbnail: "/assets/misc/placeholder.jpg",
      sections: dummySections,
      media_gallery: [],
    });

    if (!res.success) {
      setSaveLoading(false);
      showNotification(`Error adding project: ${res.error}`);
      return;
    }

    await loadProjects();
    window.dispatchEvent(new Event("projects-updated"));
    setSaveLoading(false);
    showNotification(res.warning || `Fresh project added to slot #${slotOrder}! Click row to edit.`);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, hoverIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === hoverIdx) return;
    const updated = [...projects];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(hoverIdx, 0, movedItem);
    const reordered = updated.map((item, i) => ({
      ...item,
      order_index: i + 1,
    }));
    setProjects(reordered);
    setDraggedIdx(hoverIdx);
  };

  const handleDrop = async () => {
    if (draggedIdx === null) return;
    setDraggedIdx(null);
    showNotification("Saving project order...");
    const res = await saveProjectsOrder(projects);
    if (!res.success) {
      showNotification(`Error saving order: ${res.error}`);
      return;
    }
    showNotification("Project order updated successfully!");
    window.dispatchEvent(new Event("projects-updated"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-white/60 font-mono">
          <div className="w-5 h-5 border-2 border-[#E5FE8D] border-t-transparent rounded-full animate-spin" />
          <span>VERIFYING SUPABASE SESSION...</span>
        </div>
      </div>
    );
  }

  // --- LOGIN SCREEN (UNAUTHENTICATED) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 md:p-12">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-mono-small text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> BACK TO HOME
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto bg-[#121212] border border-white/12 rounded-[20px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#E5FE8D]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-[#E5FE8D]">
            <Lock size={22} strokeWidth={2} />
          </div>

          <h1 className="text-h2 font-medium text-white mb-2">
            Supabase CMS Login
          </h1>
          <p className="text-body-small text-white/60 mb-8">
            Enter your admin credentials to access and manage live portfolio data.
          </p>

          {loginError && (
            <div className="mb-6 p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-body-small">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {loginMode === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] text-white/70 mb-2 font-mono">
                  USERNAME
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-black border border-white/15 rounded-[10px] px-4 py-3 text-white text-body-small focus:outline-none focus:border-[#E5FE8D] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/70 mb-2 font-mono">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-white/15 rounded-[10px] px-4 py-3 text-white text-body-small focus:outline-none focus:border-[#E5FE8D] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#E5FE8D] text-black font-medium py-3.5 rounded-[10px] text-body-small hover:bg-[#d4f070] transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg"
              >
                {loginLoading ? "SIGNING IN..." : "SIGN IN TO DASHBOARD"}
              </button>

              <div className="mt-2 pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError(null);
                    setLoginMode("pin");
                  }}
                  className="text-mono-small text-white/50 hover:text-[#E5FE8D] transition-colors font-mono tracking-wider cursor-pointer"
                >
                  ENTER PIN →
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 py-2">
              <div className="text-center">
                <label className="block text-[10px] text-[#E5FE8D] mb-4 tracking-widest font-mono">
                  ENTER 4-DIGIT PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPin(val);
                    setLoginError(null);
                    if (val === "9486") {
                      setIsAuthenticated(true);
                      loadProjects();
                    } else if (val.length === 4) {
                      setLoginError("Invalid PIN entered.");
                      setPin("");
                    }
                  }}
                  placeholder="••••"
                  className="w-48 mx-auto text-center bg-black border border-white/20 rounded-[14px] px-4 py-3 text-white text-h1 font-mono tracking-[0.5em] focus:outline-none focus:border-[#E5FE8D] transition-colors shadow-inner"
                />
              </div>
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError(null);
                    setLoginMode("credentials");
                    setPin("");
                  }}
                  className="text-mono-small text-white/50 hover:text-white transition-colors font-mono tracking-wider cursor-pointer"
                >
                  ← BACK TO USERNAME / PASSWORD
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---

  // Dedicated Full-Screen Fixed Editor & Live Preview View
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex overflow-hidden font-sans select-none">
        {/* Unsaved Changes Modal */}
        {showUnsavedModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/15 rounded-[12px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <h3 className="text-h3 font-medium text-white">Unsaved Changes</h3>
              <p className="text-body-small text-white/70">
                You have unsaved changes to this project. What would you like to do before exiting?
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setShowUnsavedModal(false);
                    await handleSaveProject({ preventDefault: () => { } } as any);
                  }}
                  className="w-full py-2.5 px-4 rounded-[6px] bg-[#E5FE8D] text-black font-medium text-mono-small hover:bg-[#d4f070] transition-colors cursor-pointer"
                >
                  SAVE & EXIT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedModal(false);
                    setIsEditing(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-[6px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium text-mono-small transition-colors cursor-pointer"
                >
                  DISCARD CHANGES
                </button>
                <button
                  type="button"
                  onClick={() => setShowUnsavedModal(false)}
                  className="w-full py-2 px-4 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium text-mono-small transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 p-4 rounded-[6px] bg-[#E5FE8D] text-black font-medium flex items-center gap-2.5 text-body-small shadow-2xl animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}

        {/* Left Side: Resizable Edit Panel */}
        <div
          style={{ width: `${panelWidth}%` }}
          className="h-full bg-black flex flex-col relative border-r border-white/10 shrink-0 min-w-[280px]"
        >
          {/* Top Header of Left Panel */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black">
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                type="button"
                onClick={handleBackClick}
                className="p-1.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
                title="Back to projects list"
              >
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-h2 font-medium truncate text-[18px]">
                {editingId
                  ? formTitle
                    ? `Edit ${formTitle}`
                    : "Edit Project"
                  : "Create New Project"}
              </h2>
            </div>
            <button
              type="submit"
              form="cms-project-form"
              disabled={saveLoading}
              className="py-1.5 px-4 rounded-[6px] bg-[#E5FE8D] text-black font-medium text-mono-small hover:bg-[#d4f070] transition-colors disabled:opacity-50 shrink-0 ml-3 cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              {saveLoading ? "SAVING..." : "SAVE"}
            </button>
          </div>

          {/* Scrollable Form Area inside Left Panel */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 pb-12 select-text">
            <form
              id="cms-project-form"
              onSubmit={handleSaveProject}
              className="space-y-5"
            >
              {/* Hero Section Header */}
              <div className="pt-2 pb-1">
                <h3 className="font-sans text-[20px] font-bold text-white tracking-tight">
                  Hero
                </h3>
              </div>

              {/* Project Thumbnail Upload */}
              <div className="w-full max-w-[340px] mb-4">
                <label className="block text-[10px] font-mono text-white/50 mb-1.5">
                  PROJECT THUMBNAIL *
                </label>
                <label
                  title="Tap to upload project thumbnail image or video"
                  className="cursor-pointer block group w-full"
                >
                  <input
                    type="file"
                    accept="image/*,video/*,.gif,.mp4,.webm,.mov"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                  {!formThumbnail || formThumbnail.includes("placeholder") ? (
                    <div className="relative w-full aspect-[16/10] rounded-[6px] bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-center overflow-hidden">
                      <DashedBorder rx={6} />
                      <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-[#E5FE8D] group-hover:text-black flex items-center justify-center transition-colors shadow-sm text-white/70">
                        <Plus size={20} />
                      </div>
                    </div>
                  ) : isVideoUrl(formThumbnail) ? (
                    <div className="relative inline-block w-full overflow-hidden rounded-[6px] bg-white/[0.02]">
                      <video
                        src={formThumbnail}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="max-h-[180px] w-auto object-contain rounded-[6px] transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[6px]">
                        <Edit2 size={24} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative inline-block w-full overflow-hidden rounded-[6px] bg-white/[0.02]">
                      <img
                        src={formThumbnail}
                        alt="Thumbnail Preview"
                        className="max-h-[180px] w-auto object-contain rounded-[6px] transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[6px]">
                        <Edit2 size={24} className="text-white" />
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono text-white/50 mb-1">
                    PROJECT TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Current & Growth Team"
                    className="w-full bg-black border border-white/15 rounded-[6px] px-3 py-1.5 text-white text-[13px] focus:outline-none focus:border-[#E5FE8D] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/50 mb-1">
                    ORDER *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      required
                      min={1}
                      max={projects.length || 5}
                      value={formOrder}
                      onChange={(e) =>
                        setFormOrder(parseInt(e.target.value) || 1)
                      }
                      className="flex-1 bg-black border border-white/15 rounded-[6px] px-2.5 py-1.5 text-white text-[13px] focus:outline-none focus:border-[#E5FE8D] transition-colors font-mono text-center"
                    />
                    <button
                      type="button"
                      disabled={formOrder <= 1}
                      onClick={() => setFormOrder(Math.max(1, formOrder - 1))}
                      title="Move up in list"
                      className="p-1.5 rounded-[6px] bg-white/10 hover:bg-[#E5FE8D] hover:text-black text-white disabled:opacity-20 disabled:hover:bg-white/10 disabled:hover:text-white disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={formOrder >= (projects.length || 5)}
                      onClick={() => setFormOrder(Math.min(projects.length || 5, formOrder + 1))}
                      title="Move down in list"
                      className="p-1.5 rounded-[6px] bg-white/10 hover:bg-[#E5FE8D] hover:text-black text-white disabled:opacity-20 disabled:hover:bg-white/10 disabled:hover:text-white disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono text-white/50 mb-1">
                    ROLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. PRODUCT DESIGNER"
                    className="w-full bg-black border border-white/15 rounded-[6px] px-3 py-1.5 text-white text-[13px] focus:outline-none focus:border-[#E5FE8D] transition-colors"
                  />
                </div>
              </div>

              {/* Password Protection Card inside Full Edit Form */}
              <div className="bg-[#121212] border border-white/15 rounded-[8px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className={formIsLocked ? "text-[#E5FE8D]" : "text-white/40"} />
                    <span className="text-[12px] font-mono text-white/80 font-medium uppercase tracking-wider">
                      PASSWORD PROTECTION
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsLocked}
                      onChange={(e) => setFormIsLocked(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E5FE8D] peer-checked:after:bg-black" />
                  </label>
                </div>
                {formIsLocked && (
                  <div className="pt-1">
                    <label className="block text-[10px] font-mono text-white/50 mb-1">
                      PROJECT PASSWORD *
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? "text" : "password"}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Enter access password..."
                        className="w-full bg-black border border-white/15 rounded-[6px] px-3 py-1.5 pr-9 text-white text-[13px] font-mono focus:outline-none focus:border-[#E5FE8D] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                        title={showFormPassword ? "Hide" : "Show"}
                      >
                        {showFormPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/50 mb-1">
                  DESCRIPTION (TEXT) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide an overview of what the project accomplished..."
                  className="w-full bg-black border border-white/15 rounded-[6px] px-3 py-1.5 text-white text-[13px] focus:outline-none focus:border-[#E5FE8D] transition-colors leading-relaxed"
                />
              </div>

              {/* Highlights Section without container */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[10px] font-mono text-white/50 mb-1">
                      HIGHLIGHTS (0 TO 3 ITEMS)
                    </label>
                  </div>
                  {formHighlights.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddHighlightField}
                      className="px-2.5 py-1 rounded-[6px] bg-white/10 text-white hover:bg-white/20 text-[11px] font-mono flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Plus size={13} /> ADD HIGHLIGHT
                    </button>
                  )}
                </div>

                {formHighlights.length === 0 ? (
                  <div className="text-center py-4 text-white/30 text-[12px] italic rounded-[6px]">
                    No highlights added yet. Click "+ Add Highlight" to include
                    metrics.
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {formHighlights.map((text, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#E5FE8D] w-5 shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={text}
                          onChange={(e) =>
                            handleHighlightChange(idx, e.target.value)
                          }
                          placeholder="e.g. 14.6% increase in click-through rate..."
                          className="flex-1 bg-black border border-white/15 rounded-[6px] px-2.5 py-1.5 text-white text-[12px] focus:outline-none focus:border-[#E5FE8D]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlightField(idx)}
                          className="p-1.5 rounded-[6px] bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                          title="Remove highlight"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Section Header & Area without container */}
              <div className="pt-6 space-y-4">
                <div className="pt-2 pb-1">
                  <h3 className="font-sans text-[20px] font-bold text-white tracking-tight">
                    Content
                  </h3>
                </div>

                <div className="space-y-4">
                  {formSections.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-body-small italic rounded-[6px]">
                      No content sections added yet. Use the buttons below to
                      add layout templates.
                    </div>
                  ) : (
                    formSections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        onDragEnter={(e) => handleSectionDragEnter(e, idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleSectionDrop(idx)}
                        onDragEnd={() => {
                          setDraggedSecIdx(null);
                          setFrozenPreviewSections(null);
                        }}
                        className={`bg-[#141414] rounded-[6px] p-3.5 transition-all duration-200 ${sec.hidden ? "opacity-50 bg-black/40" : ""
                          } ${draggedSecIdx === idx
                            ? "opacity-40 bg-white/10"
                            : ""
                          }`}
                      >
                        {/* Section Header Row */}
                        <div
                          draggable={true}
                          onDragStart={(e) => handleSectionDragStart(e, idx)}
                          className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="text-white/30 hover:text-[#E5FE8D] transition-colors p-0.5 -ml-1"
                              title="Drag to reorder section"
                            >
                              <GripVertical size={15} />
                            </div>
                            <span className="text-[10px] font-mono text-[#E5FE8D] uppercase font-semibold tracking-wider">
                              #{idx + 1}: {sec.type.replace(/-/g, " ")}
                            </span>
                            {sec.hidden && (
                              <span className="px-1.5 py-0.5 rounded-[4px] bg-red-500/20 text-red-400 font-mono text-[9px]">
                                HIDDEN
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleShiftSection(idx, "up")}
                              className="p-1 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                              title="Move section up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formSections.length - 1}
                              onClick={() => handleShiftSection(idx, "down")}
                              className="p-1 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                              title="Move section down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateSection(idx)}
                              className="p-1 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                              title="Duplicate section"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleHideSection(idx)}
                              className="p-1 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                              title={
                                sec.hidden ? "Show section" : "Hide section"
                              }
                            >
                              {sec.hidden ? (
                                <EyeOff size={13} />
                              ) : (
                                <Eye size={13} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(idx)}
                              className="p-1 rounded-[6px] bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Delete section"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Template Specific Fields */}
                        {sec.type === "full-width-image" && (
                          <div className="space-y-3">
                            <div>
                              <label
                                title="Tap to upload image file"
                                className="cursor-pointer block group w-fit"
                              >
                                <input
                                  type="file"
                                  accept="image/*,video/*,.gif,.mp4,.webm,.mov"
                                  onChange={(e) =>
                                    handleImageUpload(e, idx, "image1")
                                  }
                                  className="hidden"
                                />
                                {!sec.image1?.src ||
                                  sec.image1.src.includes("placeholder") ? (
                                  <div className="relative w-32 h-32 rounded-[6px] bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-center overflow-hidden">
                                    <DashedBorder rx={6} />
                                    <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-[#E5FE8D] group-hover:text-black flex items-center justify-center transition-colors shadow-sm text-white/70">
                                      <Plus size={18} />
                                    </div>
                                  </div>
                                ) : isVideoUrl(sec.image1.src) ? (
                                  <div className="relative inline-block overflow-hidden rounded-[4px]">
                                    <video
                                      src={sec.image1.src}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="max-h-[140px] w-auto object-contain rounded-[4px] transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[4px]">
                                      <Edit2 size={20} className="text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative inline-block overflow-hidden rounded-[4px]">
                                    <img
                                      src={sec.image1.src}
                                      alt="Preview"
                                      className="max-h-[140px] w-auto object-contain rounded-[4px] transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[4px]">
                                      <Edit2 size={20} className="text-white" />
                                    </div>
                                  </div>
                                )}
                              </label>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              {!sec.image1?.hideCaption ? (
                                <input
                                  type="text"
                                  value={sec.image1?.caption || ""}
                                  onChange={(e) =>
                                    handleSectionChange(idx, {
                                      image1: {
                                        ...sec.image1,
                                        caption: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Image caption text..."
                                  className="flex-1 bg-black border border-white/15 rounded-[6px] px-2.5 py-1 text-white text-[12px] font-mono focus:outline-none focus:border-[#E5FE8D]"
                                />
                              ) : (
                                <span className="flex-1 text-white/30 text-[11px] italic py-1 px-2.5 font-mono">
                                  Caption hidden
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSectionChange(idx, {
                                    image1: {
                                      ...sec.image1,
                                      hideCaption: !sec.image1?.hideCaption,
                                    },
                                  })
                                }
                                title={sec.image1?.hideCaption ? "Show caption" : "Hide caption"}
                                className="p-1.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer font-mono"
                              >
                                {sec.image1?.hideCaption ? (
                                  <EyeOff size={13} />
                                ) : (
                                  <Eye size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {sec.type === "description" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-mono text-white/50 mb-1">
                                SECTION TITLE
                              </label>
                              <input
                                type="text"
                                value={sec.title || ""}
                                onChange={(e) =>
                                  handleSectionChange(idx, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="e.g. The Challenge"
                                className="w-full bg-black border border-white/15 rounded-[6px] px-2.5 py-1.5 text-white text-[12px] font-mono focus:outline-none focus:border-[#E5FE8D]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-white/50 mb-1">
                                DESCRIPTION TEXT
                              </label>
                              <textarea
                                rows={8}
                                value={sec.content || ""}
                                onChange={(e) =>
                                  handleSectionChange(idx, {
                                    content: e.target.value,
                                  })
                                }
                                placeholder="Explain the problem, design exploration, or outcome..."
                                className="w-full bg-black border border-white/15 rounded-[6px] px-2.5 py-1.5 text-white text-[13px] focus:outline-none focus:border-[#E5FE8D] leading-relaxed"
                              />
                            </div>
                          </div>
                        )}

                        {sec.type === "two-column-image" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Column 1 */}
                            <div className="space-y-2.5">
                              <span className="block text-[10px] font-mono text-white/40 mb-1 uppercase tracking-wider">
                                left
                              </span>
                              <label
                                title="Tap to upload left image"
                                className="cursor-pointer block group w-fit"
                              >
                                <input
                                  type="file"
                                  accept="image/*,video/*,.gif,.mp4,.webm,.mov"
                                  onChange={(e) =>
                                    handleImageUpload(e, idx, "image1")
                                  }
                                  className="hidden"
                                />
                                {!sec.image1?.src ||
                                  sec.image1.src.includes("placeholder") ? (
                                  <div className="relative w-28 h-28 rounded-[6px] bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-center overflow-hidden">
                                    <DashedBorder rx={6} />
                                    <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#E5FE8D] group-hover:text-black flex items-center justify-center transition-colors shadow-sm text-white/70">
                                      <Plus size={16} />
                                    </div>
                                  </div>
                                ) : isVideoUrl(sec.image1.src) ? (
                                  <div className="relative inline-block overflow-hidden rounded-[4px]">
                                    <video
                                      src={sec.image1.src}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="max-h-[120px] w-auto object-contain rounded-[4px] transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[4px]">
                                      <Edit2 size={20} className="text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative inline-block overflow-hidden rounded-[4px]">
                                    <img
                                      src={sec.image1.src}
                                      alt="Col 1 Preview"
                                      className="max-h-[120px] w-auto object-contain rounded-[4px] transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[4px]">
                                      <Edit2 size={20} className="text-white" />
                                    </div>
                                  </div>
                                )}
                              </label>
                              <div className="flex items-center gap-2 pt-1">
                                {!sec.image1?.hideCaption ? (
                                  <input
                                    type="text"
                                    value={sec.image1?.caption || ""}
                                    onChange={(e) =>
                                      handleSectionChange(idx, {
                                        image1: {
                                          ...sec.image1,
                                          caption: e.target.value.toUpperCase(),
                                        },
                                      })
                                    }
                                    placeholder="LEFT IMAGE CAPTION..."
                                    className="flex-1 bg-black border border-white/15 rounded-[6px] px-2.5 py-1 text-white text-[10px] font-mono uppercase focus:outline-none focus:border-[#E5FE8D]"
                                  />
                                ) : (
                                  <span className="flex-1 text-white/30 text-[10px] italic py-1 px-2.5 font-mono">
                                    Caption hidden
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSectionChange(idx, {
                                      image1: {
                                        ...sec.image1,
                                        hideCaption:
                                          !sec.image1?.hideCaption,
                                      },
                                    })
                                  }
                                  title={sec.image1?.hideCaption ? "Show caption" : "Hide caption"}
                                  className="p-1.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer font-mono"
                                >
                                  {sec.image1?.hideCaption ? (
                                    <EyeOff size={13} />
                                  ) : (
                                    <Eye size={13} />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-2.5">
                              <span className="block text-[10px] font-mono text-white/40 mb-1 uppercase tracking-wider">
                                right
                              </span>
                              <label
                                title="Tap to upload right image"
                                className="cursor-pointer block group w-fit"
                              >
                                <input
                                  type="file"
                                  accept="image/*,video/*,.gif,.mp4,.webm,.mov"
                                  onChange={(e) =>
                                    handleImageUpload(e, idx, "image2")
                                  }
                                  className="hidden"
                                />
                                {!sec.image2?.src ||
                                  sec.image2.src.includes("placeholder") ? (
                                  <div className="relative w-28 h-28 rounded-[6px] bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-center overflow-hidden">
                                    <DashedBorder rx={6} />
                                    <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#E5FE8D] group-hover:text-black flex items-center justify-center transition-colors shadow-sm text-white/70">
                                      <Plus size={16} />
                                    </div>
                                  </div>
                                ) : isVideoUrl(sec.image2.src) ? (
                                  <div className="relative inline-block overflow-hidden rounded-[4px]">
                                    <video
                                      src={sec.image2.src}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="max-h-[120px] w-auto object-contain rounded-[4px] transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[4px]">
                                      <Edit2 size={20} className="text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative inline-block overflow-hidden rounded-[4px]">
                                    <img
                                      src={sec.image2.src}
                                      alt="Col 2 Preview"
                                      className="max-h-[120px] w-auto object-contain rounded-[4px] transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-[4px]">
                                      <Edit2 size={20} className="text-white" />
                                    </div>
                                  </div>
                                )}
                              </label>
                              <div className="flex items-center gap-2 pt-1">
                                {!sec.image2?.hideCaption ? (
                                  <input
                                    type="text"
                                    value={sec.image2?.caption || ""}
                                    onChange={(e) =>
                                      handleSectionChange(idx, {
                                        image2: {
                                          ...sec.image2,
                                          caption: e.target.value.toUpperCase(),
                                        },
                                      })
                                    }
                                    placeholder="RIGHT IMAGE CAPTION..."
                                    className="flex-1 bg-black border border-white/15 rounded-[6px] px-2.5 py-1 text-white text-[10px] font-mono uppercase focus:outline-none focus:border-[#E5FE8D]"
                                  />
                                ) : (
                                  <span className="flex-1 text-white/30 text-[10px] italic py-1 px-2.5 font-mono">
                                    Caption hidden
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSectionChange(idx, {
                                      image2: {
                                        ...sec.image2,
                                        hideCaption:
                                          !sec.image2?.hideCaption,
                                      },
                                    })
                                  }
                                  title={sec.image2?.hideCaption ? "Show caption" : "Hide caption"}
                                  className="p-1.5 rounded-[6px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer font-mono"
                                >
                                  {sec.image2?.hideCaption ? (
                                    <EyeOff size={13} />
                                  ) : (
                                    <Eye size={13} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Much Taller Dotted Subtle Outline 'Add New Section' Buttons */}
                <div className="pt-4">
                  <span className="block text-[10px] text-white/70 mb-3 uppercase tracking-wider text-center font-mono">
                    + ADD NEW SECTION TEMPLATE
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddSection("full-width-image")}
                      className="relative py-8 px-3 rounded-[8px] bg-transparent hover:bg-white/5 text-white/70 hover:text-white flex flex-col items-center justify-center text-center gap-2.5 transition-all group cursor-pointer overflow-hidden"
                    >
                      <DashedBorder rx={8} />
                      <ImageIcon
                        size={24}
                        className="text-white/40 group-hover:text-[#E5FE8D] transition-colors"
                      />
                      <span className="text-[10px] font-medium tracking-wider font-mono">
                        SINGLE
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddSection("two-column-image")}
                      className="relative py-8 px-3 rounded-[8px] bg-transparent hover:bg-white/5 text-white/70 hover:text-white flex flex-col items-center justify-center text-center gap-2.5 transition-all group cursor-pointer overflow-hidden"
                    >
                      <DashedBorder rx={8} />
                      <Columns
                        size={24}
                        className="text-white/40 group-hover:text-[#E5FE8D] transition-colors"
                      />
                      <span className="text-[10px] font-medium tracking-wider font-mono">
                        DOUBLE
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddSection("description")}
                      className="relative py-8 px-3 rounded-[8px] bg-transparent hover:bg-white/5 text-white/70 hover:text-white flex flex-col items-center justify-center text-center gap-2.5 transition-all group cursor-pointer overflow-hidden"
                    >
                      <DashedBorder rx={8} />
                      <FileText
                        size={24}
                        className="text-white/40 group-hover:text-[#E5FE8D] transition-colors"
                      />
                      <span className="text-[10px] font-medium tracking-wider font-mono">
                        TEXT
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={handleMouseDownResize}
          className="w-[1px] bg-white/10 hover:bg-[#E5FE8D] active:bg-[#E5FE8D] cursor-col-resize transition-colors shrink-0 z-30 relative group"
          title="Drag to resize panels"
        >
          <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize z-40" />
        </div>

        {/* Right Side: Off-black Preview Area with Mock Browser UI & Scaled Desktop View */}
        <div
          ref={previewContainerRef}
          style={{ width: `${100 - panelWidth}%` }}
          className="h-full bg-[#1E1E1E] flex items-center justify-center p-[20px] md:p-[40px] overflow-hidden relative select-none"
        >
          {/* Exact Visual Sizing Wrapper to prevent flexbox clipping/overflow */}
          <div
            style={{
              width: `${1440 * previewScale}px`,
              height: "100%",
            }}
            className="relative shrink-0 flex items-center justify-center overflow-hidden"
          >
            {/* Mock Browser Window Container */}
            <div
              style={{
                width: "1440px",
                height: `${100 / previewScale}%`,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
              className="border border-white/15 rounded-[8px] overflow-hidden bg-black shadow-2xl flex flex-col absolute top-0 left-0 select-text"
            >
              {/* Mock Browser UI Header */}
              <div className="h-11 bg-[#141414] border-b border-white/10 px-4 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[6px] px-4 py-1 text-mono-small text-white/60 flex items-center gap-1.5 max-w-xl w-full justify-left text-[12px] font-mono">
                  <span className="text-white/30">https://</span>
                  danrwood.com/projects/
                  {formTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "") || "new-project"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#E5FE8D]/10 border border-[#E5FE8D]/30 px-2 py-0.5 rounded-[4px] text-[#E5FE8D] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5FE8D] animate-pulse" />{" "}
                    LIVE PREVIEW
                  </span>
                </div>
              </div>

              {/* Scrollable Preview Body matching ProjectDetailPage layout */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-black text-white p-12 md:p-16">
                <div className="max-w-[940px] mx-auto w-full">
                  {/* Preview Back Link */}
                  <div className="mb-3 md:mb-4">
                    <div className="inline-flex items-center gap-2 text-[12px] font-mono font-medium text-white uppercase tracking-widest cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                      <ArrowLeft size={14} strokeWidth={2} className="text-white shrink-0" />
                      <span>BACK</span>
                    </div>
                  </div>

                  {/* Preview Hero Content */}
                  <div className="mb-12">
                    <div className="max-w-[720px]">
                      {formRole && (
                        <span className="text-mono-small font-mono text-[#E5FE8D] uppercase tracking-wider mb-2.5 block font-semibold">
                          {formRole}
                        </span>
                      )}
                      <h1 className="text-[32px] md:text-[38px] font-medium text-white mb-3 tracking-tight font-sans">
                        {formTitle || "Project Title"}
                      </h1>
                      <p className="text-[15px] md:text-[16px] text-white/60 leading-relaxed font-sans">
                        {formDescription || "Project description will appear here..."}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Row (0 to 3 checkmark boxes) */}
                  {formHighlights && formHighlights.filter((h) => h && typeof h === "string" && h.trim()).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                      {formHighlights.filter((h) => h && typeof h === "string" && h.trim()).map((hl, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0a0a0a] border border-[#222222] rounded-[12px] p-4 flex items-start gap-3 text-[13px] text-white/80 font-sans shadow-md"
                        >
                          <Check
                            size={14}
                            strokeWidth={2.5}
                            className="text-[#E5FE8D] shrink-0 mt-0.5"
                          />
                          <span className="leading-snug">{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Project Thumbnail Preview (matching live project detail page) */}
                  {formThumbnail && !formThumbnail.includes("placeholder") && (
                    <div className="w-full mb-16 md:mb-24">
                      <div className="w-full rounded-[12px] overflow-hidden bg-[#121212] border border-white/12 shadow-2xl relative">
                        {isVideoUrl(formThumbnail) ? (
                          <video
                            src={formThumbnail}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto block"
                          />
                        ) : (
                          <img
                            src={formThumbnail}
                            alt={formTitle || "Project thumbnail"}
                            className="w-full h-auto block"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section Layout Templates (Full-width, Description, Two-column) */}
                  <div className="space-y-16 md:space-y-24">
                    {(frozenPreviewSections || formSections).length === 0 && (
                      <div className="py-16 text-center border border-dashed border-white/15 rounded-[12px] text-white/40 font-mono text-mono-small">
                        [ NO SECTIONS ADDED YET ]
                      </div>
                    )}
                    {(frozenPreviewSections || formSections).map((sec, idx) => {
                      if (sec.hidden) return null;

                      if (sec.type === "full-width-image" && sec.image1) {
                        return (
                          <section key={sec.id || idx} className="w-full">
                            {sec.image1.src ? (
                              <div className="w-full rounded-[12px] overflow-hidden group relative">
                                {isVideoUrl(sec.image1.src) ? (
                                  <video
                                    src={sec.image1.src}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-auto block"
                                  />
                                ) : (
                                  <img
                                    src={sec.image1.src}
                                    alt={sec.image1.caption || "Full width image"}
                                    className="w-full h-auto block"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="w-full aspect-[16/9] rounded-[12px] border border-dashed border-white/15 bg-white/[0.02] relative overflow-hidden group flex items-center justify-center">
                                <span className="text-mono-small text-white/30 uppercase font-mono">
                                  [FULL WIDTH PLACEHOLDER]
                                </span>
                              </div>
                            )}
                            {!sec.image1.hideCaption && sec.image1.caption && (
                              <span className="text-mono-small text-white/40 mt-3 block uppercase tracking-wider font-mono">
                                {sec.image1.caption}
                              </span>
                            )}
                          </section>
                        );
                      }

                      if (sec.type === "description") {
                        return (
                          <section
                            key={sec.id || idx}
                            className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4"
                          >
                            <div className="md:col-span-4">
                              <h2 className="text-h2 font-medium text-white">
                                {sec.title || "Section Title"}
                              </h2>
                            </div>
                            <div className="md:col-span-8">
                              <p className="text-body text-white/70 leading-relaxed whitespace-pre-line">
                                {sec.content || "Section description text..."}
                              </p>
                            </div>
                          </section>
                        );
                      }

                      if (sec.type === "two-column-image" && sec.image1 && sec.image2) {
                        return (
                          <section
                            key={sec.id || idx}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full"
                          >
                            <div>
                              {sec.image1.src ? (
                                <div className="w-full rounded-[12px] overflow-hidden group relative">
                                  {isVideoUrl(sec.image1.src) ? (
                                    <video
                                      src={sec.image1.src}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="w-full h-auto block"
                                    />
                                  ) : (
                                    <img
                                      src={sec.image1.src}
                                      alt={sec.image1.caption || "Column 1 image"}
                                      className="w-full h-auto block"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="w-full aspect-[4/3] rounded-[12px] border border-dashed border-white/15 bg-white/[0.02] relative overflow-hidden group flex items-center justify-center">
                                  <span className="text-mono-small text-white/30 uppercase font-mono">
                                    [COLUMN 1 PLACEHOLDER]
                                  </span>
                                </div>
                              )}
                              {!sec.image1.hideCaption && sec.image1.caption && (
                                <span className="text-mono-small text-white/40 mt-3 block uppercase tracking-wider font-mono">
                                  {sec.image1.caption}
                                </span>
                              )}
                            </div>
                            <div>
                              {sec.image2.src ? (
                                <div className="w-full rounded-[12px] overflow-hidden group relative">
                                  {isVideoUrl(sec.image2.src) ? (
                                    <video
                                      src={sec.image2.src}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="w-full h-auto block"
                                    />
                                  ) : (
                                    <img
                                      src={sec.image2.src}
                                      alt={sec.image2.caption || "Column 2 image"}
                                      className="w-full h-auto block"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="w-full aspect-[4/3] rounded-[12px] border border-dashed border-white/15 bg-white/[0.02] relative overflow-hidden group flex items-center justify-center">
                                  <span className="text-mono-small text-white/30 uppercase font-mono">
                                    [COLUMN 2 PLACEHOLDER]
                                  </span>
                                </div>
                              )}
                              {!sec.image2.hideCaption && sec.image2.caption && (
                                <span className="text-mono-small text-white/40 mt-3 block uppercase tracking-wider font-mono">
                                  {sec.image2.caption}
                                </span>
                              )}
                            </div>
                          </section>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedAdminCard = (item: VisualFeedItem) => {
    const idx = visualFeed.findIndex((f) => f.id === item.id);
    return (
      <div
        key={item.id}
        draggable={true}
        onDragStart={(e) => handleFeedDragStart(e, idx)}
        onDragEnter={(e) => handleFeedDragEnter(e, idx)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFeedDrop}
        onDragEnd={handleFeedDrop}
        className={`group block w-full rounded-[12px] border border-white/12 overflow-hidden relative shadow-lg bg-[#141414] transition-all duration-200 h-auto ${draggedFeedIdx === idx ? "opacity-30 scale-95 border-[#E5FE8D]" : ""
          }`}
      >
        <input
          type="file"
          id={`feed-file-${item.id}`}
          accept="image/*,video/*,.gif"
          onChange={(e) => handleFeedFileChange(e, item.id)}
          className="hidden"
        />

        {isVideoUrl(item.src) ? (
          <video
            src={item.src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto block"
          />
        ) : (
          <img
            src={item.src || "/assets/misc/placeholder.jpg"}
            alt={item.title}
            className="w-full h-auto block"
          />
        )}

        {/* Hover Overlay: 3 action buttons in the middle */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingFeedCaptionItem(item);
              setFeedCaptionInput(item.title || "");
            }}
            title="Edit Caption"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:scale-105 transition-all flex items-center justify-center shadow-xl cursor-pointer"
          >
            <Type size={18} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById(`feed-file-${item.id}`)?.click();
            }}
            title="Swap Media"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:scale-105 transition-all flex items-center justify-center shadow-xl cursor-pointer"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteVisualFeedItem(item.id);
            }}
            title="Delete Item"
            className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-600 border border-red-400/30 text-white hover:scale-105 transition-all flex items-center justify-center shadow-xl cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  // --- STANDARD PROJECTS LIST VIEW (WHEN !isEditing) ---
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 font-medium text-white">Dan&apos;s Portfolio CMS</h1>
            <span className="px-2.5 py-1 rounded-[6px] bg-[#E5FE8D]/10 text-[#E5FE8D] text-[11px] font-mono border border-[#E5FE8D]/30 flex items-center gap-1.5">
              <Database size={12} /> SUPABASE LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/"
            target="_blank"
            title="View Live Site"
            className="px-3.5 py-2 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition-colors flex items-center gap-2 font-medium text-[13px] cursor-pointer"
          >
            <Globe size={15} />
            <span>View website</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="px-3.5 py-2 rounded-[8px] bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium text-[13px] cursor-pointer ml-auto md:ml-0"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="max-w-6xl mx-auto mb-6 p-4 rounded-[8px] bg-[#E5FE8D]/10 border border-[#E5FE8D]/40 text-[#E5FE8D] flex items-center gap-3 text-body-small animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Segmented Section Controller */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center bg-white/5 border border-white/10 rounded-[10px] p-1 w-fit">
        {(["projects", "visual_feed", "career", "history"] as const).map((sec) => {
          const labels = {
            projects: "Projects",
            visual_feed: "Visual Feed",
            career: "Career",
            history: "History",
          };
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 h-[32px] rounded-[8px] text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                activeSection === sec ? "bg-white/15 text-white shadow-sm" : "text-white/50 hover:text-white"
              }`}
            >
              {labels[sec]}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto space-y-16 pb-24">
        {/* Projects Section */}
        {activeSection === "projects" && (
        <div className="space-y-4">
          <h2 className="text-h1 font-medium text-white">Projects</h2>
          <div className="bg-black border border-white/15 rounded-[12px] overflow-hidden shadow-2xl">
            {/* Column Headers Row: order, details, actions */}
            <div className="px-6 py-4 bg-transparent border-b border-white/10 grid grid-cols-12 gap-4 text-[11px] font-mono text-white/50 uppercase tracking-wider select-none">
              <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                <span>ORDER</span>
              </div>
              <div className="col-span-3 md:col-span-2">
                <span>THUMBNAIL</span>
              </div>
              <div className="col-span-4 md:col-span-7">
                <span>DETAILS</span>
              </div>
              <div className="col-span-3 md:col-span-2 text-right">
                <span>ACTIONS</span>
              </div>
            </div>

            <div>
              {projects.slice(0, 5).map((proj, idx) => (
                <div
                  key={proj.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDrop}
                  onClick={() => openEditForm(proj)}
                  className={`group px-6 py-4 border-b border-white/10 last:border-b-0 grid grid-cols-12 gap-4 items-center bg-black hover:bg-white/[0.03] transition-all duration-200 cursor-pointer ${draggedIdx === idx ? "opacity-30 bg-white/10 scale-[0.99]" : ""
                    }`}
                >
                  {/* Order Column + Grabber Icon */}
                  <div className="col-span-2 md:col-span-1 flex items-center gap-2 md:gap-3">
                    <div
                      className="text-white/20 group-hover:text-[#E5FE8D] transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 shrink-0"
                      title="Drag row to reorder"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical size={18} />
                    </div>
                    <span className="text-body font-mono font-medium text-white/80 group-hover:text-white">
                      {proj.order_index}
                    </span>
                  </div>

                  {/* Thumbnail Column */}
                  <div className="col-span-3 md:col-span-2 flex items-center">
                    <div className="w-16 h-10 rounded-[4px] overflow-hidden bg-white/5 relative shrink-0 border border-white/10 flex items-center justify-center">
                      {isVideoUrl(proj.thumbnail) ? (
                        <video
                          src={proj.thumbnail}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={proj.thumbnail || "/assets/misc/placeholder.jpg"}
                          alt={proj.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Details Column: Just show project name */}
                  <div className="col-span-4 md:col-span-7 truncate">
                    <h3 className="text-h2 font-medium text-white group-hover:text-[#E5FE8D] transition-colors truncate">
                      {proj.title}
                    </h3>
                  </div>

                  {/* Actions Column */}
                  <div
                    className="col-span-3 md:col-span-2 flex items-center justify-end gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setQuickLockProject(proj);
                        setQuickIsLocked(!!proj.is_locked);
                        setQuickPassword(proj.password || "");
                        setShowQuickPassword(false);
                      }}
                      className={`p-1.5 rounded-[4px] transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1 ${
                        proj.is_locked
                          ? "bg-[#E5FE8D]/15 text-[#E5FE8D] hover:bg-[#E5FE8D]/25"
                          : "text-white/40 hover:text-white/80 opacity-0 group-hover:opacity-100"
                      }`}
                      title={proj.is_locked ? "Password Protected (Click to configure)" : "Add password protection"}
                    >
                      <Lock size={15} />
                    </button>
                    <button
                      onClick={() => openEditForm(proj)}
                      className="p-1.5 rounded-[4px] text-white/70 hover:text-[#E5FE8D] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shrink-0"
                      title="Edit project"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.title)}
                      className="p-1.5 rounded-[4px] bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer shrink-0"
                      title="Delete project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty Slots to maintain 5 total project rows */}
              {Array.from(
                { length: Math.max(0, 5 - projects.slice(0, 5).length) },
                (_, i) => projects.slice(0, 5).length + 1 + i
              ).map((slotOrder) => (
                <div
                  key={`empty-slot-${slotOrder}`}
                  className="group px-6 py-4 border-b border-white/10 last:border-b-0 grid grid-cols-12 gap-4 items-center bg-black/40 hover:bg-white/[0.02] transition-all duration-200"
                >
                  {/* Order Column */}
                  <div className="col-span-2 md:col-span-1 flex items-center gap-2 md:gap-3">
                    <div className="w-[26px] shrink-0" />
                    <span className="text-body font-mono font-medium text-white/30">
                      {slotOrder}
                    </span>
                  </div>

                  {/* Thumbnail Column */}
                  <div className="col-span-3 md:col-span-2 flex items-center">
                    <div className="relative w-16 h-10 rounded-[4px] bg-white/[0.02] flex items-center justify-center shrink-0 overflow-hidden">
                      <DashedBorder rx={4} />
                      <span className="text-[9px] font-mono text-white/20">EMPTY</span>
                    </div>
                  </div>

                  {/* Details Column: Helper Text */}
                  <div className="col-span-4 md:col-span-7 truncate">
                    <span className="text-body-small font-mono text-white/40 italic truncate block">
                      Empty Project Slot — Click (+) button to populate with dummy starter content & placeholder media
                    </span>
                  </div>

                  {/* Actions Column: Plus Button */}
                  <div className="col-span-3 md:col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddDummyProject(slotOrder)}
                      disabled={saveLoading}
                      title="Populate slot with dummy project"
                      className="p-1.5 rounded-[6px] bg-[#E5FE8D]/10 hover:bg-[#E5FE8D] text-[#E5FE8D] hover:text-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0 border border-[#E5FE8D]/30"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Visual Feed Section */}
        {activeSection === "visual_feed" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h1 font-medium text-white">Visual feed</h2>
            </div>
            <button
              onClick={handleAddVisualFeedItem}
              title="Add New Feed Item"
              className="px-3.5 py-2 rounded-[8px] bg-[#E5FE8D] text-black hover:bg-[#d4f070] transition-colors flex items-center gap-2 font-medium text-[13px] cursor-pointer shadow-lg"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add new</span>
            </button>
          </div>

          {/* Replica Preview Masonry Grid */}
          <div className="w-full">
            {/* Mobile 1-Column Grid */}
            <div className="flex flex-col gap-2 md:hidden">
              {visualFeed.map((item) => renderFeedAdminCard(item))}
            </div>

            {/* Tablet 2-Column Grid */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                {visualFeed.filter((_, i) => i % 2 === 0).map((item) => renderFeedAdminCard(item))}
              </div>
              <div className="flex flex-col gap-2">
                {visualFeed.filter((_, i) => i % 2 === 1).map((item) => renderFeedAdminCard(item))}
              </div>
            </div>

            {/* Desktop 3-Column Masonry Grid */}
            <div className="hidden lg:grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-2">
                {visualFeed.filter((_, i) => i % 3 === 0).map((item) => renderFeedAdminCard(item))}
              </div>
              <div className="flex flex-col gap-2">
                {visualFeed.filter((_, i) => i % 3 === 1).map((item) => renderFeedAdminCard(item))}
              </div>
              <div className="flex flex-col gap-2">
                {visualFeed.filter((_, i) => i % 3 === 2).map((item) => renderFeedAdminCard(item))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* History Grid Photos Section */}
        {activeSection === "history" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h1 font-medium text-white">History</h2>
            </div>
            <button
              onClick={handleAddPhoto}
              className="px-3.5 py-2 rounded-[8px] bg-[#E5FE8D] text-black hover:bg-[#d4f070] transition-colors flex items-center gap-2 font-medium text-[13px] cursor-pointer shadow-lg"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add new</span>
            </button>
          </div>

          <div className="w-full bg-black border border-white/12 rounded-[12px] overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-mono-small text-white/40 font-medium">
              <div className="col-span-1">ORDER</div>
              <div className="col-span-2">PREVIEW</div>
              <div className="col-span-5">IMAGE SOURCE URL / PATH</div>
              <div className="col-span-3">ALT / CAPTION</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>

            <div>
              {historyPhotos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  draggable={true}
                  onDragStart={(e) => handlePhotoDragStart(e, idx)}
                  onDragEnter={(e) => handlePhotoDragEnter(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={handlePhotoDrop}
                  onDragEnd={handlePhotoDrop}
                  className={`group px-6 py-4 border-b border-white/10 last:border-b-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-black hover:bg-white/[0.03] transition-all duration-200 ${draggedPhotoIdx === idx ? "opacity-30 bg-white/10 scale-[0.99]" : ""}`}
                >
                  <div className="col-span-1 flex items-center gap-2 md:gap-3">
                    <div
                      className="text-white/20 group-hover:text-[#E5FE8D] transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 shrink-0"
                      title="Drag row to reorder"
                    >
                      <GripVertical size={18} />
                    </div>
                    <span className="text-body font-mono font-medium text-white/80 group-hover:text-white">
                      {photo.order_index}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div className="w-12 h-12 rounded-[6px] overflow-hidden bg-white/5 border border-white/10 relative shrink-0">
                      <img
                        src={photo.src || "/assets/misc/placeholder.jpg"}
                        alt={photo.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="col-span-5 flex items-center gap-2">
                    <input
                      type="text"
                      value={photo.src}
                      onChange={(e) => handleUpdatePhotoField(photo.id, "src", e.target.value)}
                      placeholder="/assets/photos/..."
                      className="w-full bg-white/5 border border-white/10 rounded-[6px] px-3 py-2 text-white text-mono-small focus:border-[#E5FE8D] outline-none transition-colors"
                    />
                    <label className="cursor-pointer p-2 bg-white/10 hover:bg-[#E5FE8D] hover:text-black text-white/70 rounded-[6px] transition-colors shrink-0" title="Upload file to R2">
                      <Plus size={14} />
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoFileUpload(e, photo.id)} className="hidden" />
                    </label>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="text"
                      value={photo.alt}
                      onChange={(e) => handleUpdatePhotoField(photo.id, "alt", e.target.value)}
                      placeholder="Caption / Alt text..."
                      className="w-full bg-white/5 border border-white/10 rounded-[6px] px-3 py-2 text-white text-mono-small focus:border-[#E5FE8D] outline-none transition-colors"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="p-1.5 rounded-[4px] text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Career & Education History Section */}
        {activeSection === "career" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-h1 font-medium text-white">Career</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-[8px] p-1">
                <button
                  onClick={() => setCareerTab("career")}
                  className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer ${careerTab === "career" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}
                >
                  Career History
                </button>
                <button
                  onClick={() => setCareerTab("education")}
                  className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer ${careerTab === "education" ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}
                >
                  Education History
                </button>
              </div>
              <button
                onClick={handleAddCareerItem}
                className="px-3.5 py-2 rounded-[8px] bg-[#E5FE8D] text-black hover:bg-[#d4f070] transition-colors flex items-center gap-2 font-medium text-[13px] cursor-pointer shadow-lg"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add new</span>
              </button>
            </div>
          </div>

          <div className="w-full bg-black border border-white/12 rounded-[12px] overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-mono-small text-white/40 font-medium">
              <div className="col-span-1">ORDER</div>
              <div className="col-span-4">{careerTab === "career" ? "COMPANY" : "INSTITUTION"}</div>
              <div className="col-span-4">{careerTab === "career" ? "ROLE" : "DEGREE / CERTIFICATE"}</div>
              <div className="col-span-2">YEARS</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>

            <div>
              {(careerTab === "career" ? careerItems : educationItems).map((item, idx) => (
                <div
                  key={item.id || idx}
                  draggable={true}
                  onDragStart={(e) => handleCareerDragStart(e, idx)}
                  onDragEnter={(e) => handleCareerDragEnter(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={handleCareerDrop}
                  onDragEnd={handleCareerDrop}
                  className={`group px-6 py-4 border-b border-white/10 last:border-b-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-black hover:bg-white/[0.03] transition-all duration-200 ${(careerTab === "career" ? draggedCareerIdx : draggedEduIdx) === idx ? "opacity-30 bg-white/10 scale-[0.99]" : ""}`}
                >
                  <div className="col-span-1 flex items-center gap-2 md:gap-3">
                    <div
                      className="text-white/20 group-hover:text-[#E5FE8D] transition-colors cursor-grab active:cursor-grabbing p-1 -ml-1 shrink-0"
                      title="Drag row to reorder"
                    >
                      <GripVertical size={18} />
                    </div>
                    <span className="text-body font-mono font-medium text-white/80 group-hover:text-white">
                      {item.order_index || idx + 1}
                    </span>
                  </div>

                  <div className="col-span-4 flex items-center gap-2">
                    <input
                      type="text"
                      value={item.company}
                      onChange={(e) => handleUpdateCareerField(idx, "company", e.target.value)}
                      placeholder={careerTab === "career" ? "Company name..." : "University/School..."}
                      className="w-full bg-white/5 border border-white/10 rounded-[6px] px-3 py-2 text-white text-mono-small focus:border-[#E5FE8D] outline-none transition-colors font-medium"
                    />
                    {careerTab === "career" && (
                      <button
                        onClick={() => handleUpdateCareerField(idx, "isCurrent", !item.isCurrent)}
                        className={`px-2.5 py-1 rounded-[4px] text-[10px] font-mono font-medium shrink-0 cursor-pointer transition-colors ${item.isCurrent ? "bg-[#E5FE8D] text-black" : "bg-white/10 text-white/40 hover:text-white"}`}
                        title="Toggle if current position"
                      >
                        {item.isCurrent ? "CURRENT" : "PAST"}
                      </button>
                    )}
                  </div>

                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => handleUpdateCareerField(idx, "role", e.target.value)}
                      placeholder={careerTab === "career" ? "Job title..." : "Degree/Diploma..."}
                      className="w-full bg-white/5 border border-white/10 rounded-[6px] px-3 py-2 text-white/70 text-mono-small focus:border-[#E5FE8D] outline-none transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.year}
                      onChange={(e) => handleUpdateCareerField(idx, "year", e.target.value)}
                      placeholder="2020 - 2022"
                      className="w-full bg-white/5 border border-white/10 rounded-[6px] px-3 py-2 text-white/50 text-mono-small focus:border-[#E5FE8D] outline-none transition-colors"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => handleRemoveCareerItem(item.id, idx)}
                      className="p-1.5 rounded-[4px] text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Edit Feed Caption Modal */}
      {editingFeedCaptionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1F1F1F] border border-white/15 rounded-[16px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-[16px] font-medium text-white">Edit Caption</h3>
              <button
                onClick={() => setEditingFeedCaptionItem(null)}
                className="text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-mono-small text-white/60 mb-2">
                Caption / Title
              </label>
              <input
                type="text"
                value={feedCaptionInput}
                onChange={(e) => setFeedCaptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveFeedCaption();
                }}
                placeholder="Enter caption..."
                className="w-full bg-black/50 border border-white/15 rounded-[8px] px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#E5FE8D] transition-colors font-mono"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingFeedCaptionItem(null)}
                className="px-4 py-2 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] font-medium text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeedCaption}
                className="px-4 py-2 rounded-[8px] bg-[#E5FE8D] hover:bg-[#d4f07a] text-black text-[13px] font-medium transition-all cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Password Protection Modal */}
      {quickLockProject && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/15 rounded-[16px] p-6 max-w-[400px] w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#1A1E08] border border-[#E5FE8D]/30 flex items-center justify-center text-[#E5FE8D]">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-white">Password Protection</h3>
                  <span className="text-[12px] text-white/50 block truncate max-w-[220px]">
                    {quickLockProject.title}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setQuickLockProject(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickLock} className="space-y-4">
              <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-[10px] p-3.5">
                <span className="text-[13px] text-white/80 font-mono">Enable Lock</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickIsLocked}
                    onChange={(e) => setQuickIsLocked(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E5FE8D] peer-checked:after:bg-black" />
                </label>
              </div>

              {quickIsLocked && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-mono text-white/60 uppercase">
                    Access Password
                  </label>
                  <div className="relative">
                    <input
                      type={showQuickPassword ? "text" : "password"}
                      value={quickPassword}
                      onChange={(e) => setQuickPassword(e.target.value)}
                      placeholder="Enter password..."
                      required={quickIsLocked}
                      className="w-full bg-black border border-white/15 rounded-[8px] px-3.5 py-2.5 pr-10 text-white text-[13px] font-mono focus:outline-none focus:border-[#E5FE8D] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickPassword(!showQuickPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                    >
                      {showQuickPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setQuickLockProject(null)}
                  className="px-4 py-2 rounded-[8px] bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickSaveLoading}
                  className="px-5 py-2 rounded-[8px] bg-[#E5FE8D] hover:bg-[#d4f07a] text-black font-medium text-[13px] transition-all disabled:opacity-50"
                >
                  {quickSaveLoading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
