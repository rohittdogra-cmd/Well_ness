"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Upload,
  Sparkles,
  Shield,
  Check,
  Copy,
  Users,
  Stethoscope,
  Clock,
  Search,
  ExternalLink,
  X,
  AlertCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useLiveOffers,
  useLiveDoctors,
  useLiveGroups,
  type LiveOffer,
  type LiveDoctor,
} from "@/lib/liveDataManager";
import { groupCategories, getCategory } from "@/lib/groupCategories";
import type { Group } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";

// ─── AUTHORIZED ADMINS BANNER ─────────────────────────────────────

export function AuthorizedAdminsBanner() {
  const { user } = useInternetIdentity();

  return (
    <div className="mb-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/25 rounded-2xl p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Authorized Live Admin Session
              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2">
                FULL AUTHORITY
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Direct live website controls: changes to offers, doctors, and groups reflect immediately for all visitors.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-background/80 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-medium text-foreground">{user?.email || "Admin User"}</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700">
              Active Admin
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OFFERS & PERKS MANAGEMENT TAB ────────────────────────────────

export function OffersManagementTab() {
  const { offers, addOffer, updateOffer, toggleOffer, deleteOffer } = useLiveOffers();
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<LiveOffer | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LiveOffer["category"]>("Therapy");
  const [badge, setBadge] = useState("SPECIAL DEAL");
  const [expiry, setExpiry] = useState("Valid till Dec 31, 2026");
  const [active, setActive] = useState(true);

  function openCreateModal() {
    setEditingOffer(null);
    setTitle("");
    setCode("");
    setDiscount("");
    setDescription("");
    setCategory("Therapy");
    setBadge("SPECIAL DEAL");
    setExpiry("Valid till Dec 31, 2026");
    setActive(true);
    setModalOpen(true);
  }

  function openEditModal(offer: LiveOffer) {
    setEditingOffer(offer);
    setTitle(offer.title);
    setCode(offer.code);
    setDiscount(offer.discount);
    setDescription(offer.description);
    setCategory(offer.category);
    setBadge(offer.badge);
    setExpiry(offer.expiry);
    setActive(offer.active);
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !discount.trim()) {
      toast.error("Please fill in title, promo code, and discount text.");
      return;
    }

    if (editingOffer) {
      updateOffer(editingOffer.id, {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        discount: discount.trim(),
        description: description.trim(),
        category,
        badge: badge.trim(),
        expiry: expiry.trim(),
        active,
      });
      toast.success(`Offer "${title}" updated on live website!`);
    } else {
      addOffer({
        title: title.trim(),
        code: code.trim().toUpperCase(),
        discount: discount.trim(),
        description: description.trim(),
        category,
        badge: badge.trim(),
        expiry: expiry.trim(),
        active,
      });
      toast.success(`New offer "${title}" created and published live!`);
    }
    setModalOpen(false);
  }

  const filteredOffers = filterCategory === "All"
    ? offers
    : offers.filter((o) => o.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            Live Offers &amp; Corporate Perks
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage promotional codes, corporate discounts, and seasonal therapy allowances displayed across the live site.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Offer
        </Button>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground font-medium mr-1">Filter category:</span>
        {["All", "Therapy", "Corporate", "Activities", "Student"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              filterCategory === cat
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat} {cat === "All" ? `(${offers.length})` : `(${offers.filter(o => o.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffers.map((offer) => (
          <Card
            key={offer.id}
            className={`overflow-hidden border transition-all ${
              offer.active ? "border-emerald-500/30 bg-card" : "border-border/60 bg-muted/30 opacity-75"
            }`}
          >
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      offer.active
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {offer.discount}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {offer.badge}
                  </span>
                </div>

                <h3 className="font-bold text-foreground text-base mb-1">{offer.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {offer.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <code className="bg-emerald-500/10 text-emerald-800 font-mono font-bold text-xs px-2 py-1 rounded">
                      {offer.code}
                    </code>
                    <Badge variant="secondary" className="text-[10px]">
                      {offer.category}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-muted-foreground">{offer.expiry}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={offer.active ? "default" : "outline"}
                      className={`h-7 text-xs px-2.5 rounded-lg ${
                        offer.active ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      }`}
                      onClick={() => {
                        toggleOffer(offer.id);
                        toast.success(`Offer "${offer.title}" set to ${offer.active ? "Inactive" : "Active"}!`);
                      }}
                    >
                      {offer.active ? "● Live on Site" : "○ Inactive"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditModal(offer)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-red-600"
                      onClick={() => {
                        if (confirm(`Delete offer "${offer.title}"?`)) {
                          deleteOffer(offer.id);
                          toast.success("Offer removed from live site.");
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-background border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display text-foreground">
                {editingOffer ? "Edit Live Offer" : "Create New Live Offer"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% Off First Anonymous Therapy Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STRESSFREE50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Discount / Perk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50% OFF or ₹500 Cashback"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="Therapy">Therapy</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Activities">Activities</option>
                    <option value="Student">Student</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MOST POPULAR, EXCLUSIVE"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Validity Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Valid till Dec 31, 2026 or Annual Pass"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe eligibility, conditions, and benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeOfferCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeOfferCheck" className="text-xs font-medium text-foreground cursor-pointer">
                  Publish active immediately on live website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingOffer ? "Save Changes" : "Publish Offer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DOCTOR / PSYCHOLOGIST MANAGEMENT TAB ─────────────────────────

export function DoctorManagementTab() {
  const { doctors, addDoctor, updateDoctor, toggleDoctor, deleteDoctor } = useLiveDoctors();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LiveDoctor | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [fee, setFee] = useState("₹1,200 / session");
  const [image, setImage] = useState("");
  const [availability, setAvailability] = useState<LiveDoctor["availability"]>("Available Now");
  const [rating, setRating] = useState("4.9 ★ (150+ sessions)");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("English, Hindi");
  const [active, setActive] = useState(true);

  const presetPhotos = [
    { label: "Dr. Female 1", url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" },
    { label: "Dr. Male 1", url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" },
    { label: "Dr. Female 2", url: "https://images.unsplash.com/photo-1594824436951-7f12bc50616b?w=400&q=80" },
    { label: "Dr. Male 2", url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80" },
    { label: "Dr. Female 3", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" },
  ];

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function openCreateModal() {
    setEditingDoc(null);
    setName("");
    setTitle("Senior Clinical Psychologist");
    setSpecialty("Workplace Burnout & Anxiety");
    setExperience("8+ years experience");
    setFee("₹1,200 / session");
    setImage("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80");
    setAvailability("Available Now");
    setRating("4.9 ★ (120+ sessions)");
    setBio("Specializing in adult behavioral therapy, corporate burnout, and confidential counseling.");
    setLanguages("English, Hindi");
    setActive(true);
    setModalOpen(true);
  }

  function openEditModal(doc: LiveDoctor) {
    setEditingDoc(doc);
    setName(doc.name);
    setTitle(doc.title);
    setSpecialty(doc.specialty);
    setExperience(doc.experience);
    setFee(doc.fee);
    setImage(doc.image);
    setAvailability(doc.availability);
    setRating(doc.rating);
    setBio(doc.bio);
    setLanguages(doc.languages || "English, Hindi");
    setActive(doc.active);
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Doctor name is required.");
      return;
    }

    if (editingDoc) {
      updateDoctor(editingDoc.id, {
        name: name.trim(),
        title: title.trim(),
        specialty: specialty.trim(),
        experience: experience.trim(),
        fee: fee.trim(),
        image: image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
        availability,
        rating: rating.trim(),
        bio: bio.trim(),
        languages: languages.trim(),
        active,
      });
      toast.success(`Doctor profile for ${name} updated on live site!`);
    } else {
      addDoctor({
        name: name.trim(),
        title: title.trim(),
        specialty: specialty.trim(),
        experience: experience.trim(),
        fee: fee.trim(),
        image: image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
        availability,
        rating: rating.trim(),
        bio: bio.trim(),
        languages: languages.trim(),
        active,
      });
      toast.success(`New doctor ${name} added to therapy directory!`);
    }
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            Certified Doctors &amp; Psychologists Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Add doctors, modify consultation fees, change live availability slots, and control who is visible on /therapy.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Doctor / Therapist
        </Button>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((doc) => (
          <Card
            key={doc.id}
            className={`overflow-hidden border transition-all ${
              doc.active ? "border-border bg-card" : "border-border/60 bg-muted/30 opacity-70"
            }`}
          >
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-foreground text-base truncate">{doc.name}</h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          doc.active ? "border-emerald-500/40 text-emerald-700 bg-emerald-500/10" : "text-muted-foreground"
                        }`}
                      >
                        {doc.active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-700 font-medium truncate">{doc.title}</p>
                    <p className="text-[11px] text-muted-foreground">{doc.specialty}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {doc.bio}
                </p>

                <div className="bg-muted/50 p-2.5 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultation Fee:</span>
                    <strong className="text-foreground">{doc.fee}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating &amp; Sessions:</span>
                    <span className="font-medium text-foreground">{doc.rating}</span>
                  </div>
                  {doc.languages && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Languages:</span>
                      <span className="text-foreground">{doc.languages}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                {/* Availability Selector */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Live Slot:</span>
                  <select
                    value={doc.availability}
                    onChange={(e) => {
                      updateDoctor(doc.id, { availability: e.target.value as any });
                      toast.success(`Updated ${doc.name}'s slot to "${e.target.value}"`);
                    }}
                    className="text-xs px-2 py-1 rounded border border-input bg-background font-medium"
                  >
                    <option value="Available Now">Available Now</option>
                    <option value="Next slot 5:00 PM">Next slot 5:00 PM</option>
                    <option value="Available Tomorrow">Available Tomorrow</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    size="sm"
                    variant={doc.active ? "default" : "outline"}
                    className={`h-7 text-xs px-2.5 rounded-lg ${
                      doc.active ? "bg-emerald-600 hover:bg-emerald-700" : ""
                    }`}
                    onClick={() => {
                      toggleDoctor(doc.id);
                      toast.success(`${doc.name} status updated.`);
                    }}
                  >
                    {doc.active ? "Visible on Therapy" : "Hidden from Site"}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditModal(doc)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-red-600"
                      onClick={() => {
                        if (confirm(`Remove doctor ${doc.name} from directory?`)) {
                          deleteDoctor(doc.id);
                          toast.success(`${doc.name} removed.`);
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-background border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display text-foreground">
                {editingDoc ? "Edit Doctor Profile" : "Add New Doctor / Psychologist"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Chhavi Dogra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Title / Degree
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Clinical Psychologist, MD"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Workplace Burnout & Anxiety"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10+ years experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Consultation Fee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,200 / session or Free with Corporate"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Availability Slot
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="Available Now">Available Now</option>
                    <option value="Next slot 5:00 PM">Next slot 5:00 PM</option>
                    <option value="Available Tomorrow">Available Tomorrow</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload & Presets */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Doctor Photo
                </label>
                <div className="flex items-center gap-3 mb-2">
                  {image && (
                    <img
                      src={image}
                      alt="Doctor Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    />
                  )}
                  <label className="cursor-pointer px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-lg font-medium border border-border">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                  <span className="text-[11px] text-muted-foreground">or pick preset photo:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {presetPhotos.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImage(p.url)}
                      className={`text-[10px] px-2 py-1 rounded border ${
                        image === p.url ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-border"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Short Bio / Focus
                </label>
                <textarea
                  rows={2}
                  placeholder="Focus areas, evidence-based methods, client approach..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. English, Hindi, Punjabi"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Rating / Reviews Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4.9 ★ (180+ sessions)"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeDocCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeDocCheck" className="text-xs font-medium text-foreground cursor-pointer">
                  Display doctor actively in live therapy directory
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingDoc ? "Save Doctor Profile" : "Add to Directory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GROUPS FORMATION & GROUP IMAGE UPLOAD TAB ────────────────────

export function GroupsFormationTab() {
  const { groups, addGroup, updateGroup, deleteGroup } = useLiveGroups();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("sports");
  const [description, setDescription] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const presetImages = [
    { label: "Football Turf", url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80" },
    { label: "Cricket Stadium", url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80" },
    { label: "Yoga & Meditation", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" },
    { label: "Coffee & Networking", url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80" },
    { label: "Aravali Treks", url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80" },
    { label: "Tech & Startup", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" },
    { label: "Art & Pottery", url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80" },
    { label: "Books & Learning", url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80" },
  ];

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image file is too large. Please select an image under 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  function openCreateModal() {
    setEditingGroup(null);
    setName("");
    setCategory("sports");
    setDescription("");
    setMemberCount(1);
    setImageUrl("");
    setImagePreview("");
    setModalOpen(true);
  }

  function openEditModal(g: Group) {
    setEditingGroup(g);
    setName(g.name);
    setCategory(g.category);
    setDescription(g.description);
    setMemberCount(g.member_count);
    setImageUrl(g.image || "");
    setImagePreview(g.image || "");
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required.");
      return;
    }

    if (editingGroup) {
      updateGroup(editingGroup.id, {
        name: name.trim(),
        category,
        description: description.trim(),
        member_count: Number(memberCount) || 1,
        image: imagePreview || imageUrl || undefined,
      });
      toast.success(`Group "${name}" updated on live website!`);
    } else {
      addGroup({
        name: name.trim(),
        category,
        description: description.trim(),
        member_count: Number(memberCount) || 1,
        image: imagePreview || imageUrl || undefined,
      });
      toast.success(`New group "${name}" formed and published live!`);
    }
    setModalOpen(false);
  }

  const filteredGroups = groups.filter((g) => {
    const matchCat = selectedCat === "all" || g.category === selectedCat;
    const matchSearch =
      !search.trim() ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Groups Formation &amp; Cover Photo Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Form new corporate and interest groups, upload high-res cover photos, and manage existing groups over the live site.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Form New Group
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center w-full sm:w-auto">
          <span className="text-xs text-muted-foreground mr-1">Category:</span>
          {["all", "sports", "wellbeing", "social", "outdoors", "arts", "learning"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-xs px-2.5 py-1 rounded-full capitalize transition-colors ${
                selectedCat === cat
                  ? "bg-emerald-600 text-white font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGroups.map((g) => {
          const c = getCategory(g.category);
          return (
            <Card key={g.id} className="overflow-hidden border border-border bg-card flex flex-col justify-between">
              <div>
                {g.image ? (
                  <div className="relative w-full h-36 bg-muted overflow-hidden">
                    <img
                      src={g.image}
                      alt={g.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <Badge className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] border-none">
                      {c.name}
                    </Badge>
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center relative">
                    <c.icon className="w-8 h-8 text-emerald-600 opacity-60" />
                    <Badge className="absolute top-2.5 left-2.5 bg-background/80 text-foreground text-[10px]">
                      {c.name}
                    </Badge>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-bold text-foreground text-base mb-1">{g.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {g.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{g.member_count} members</span>
                    <span>·</span>
                    <span className="font-mono text-[11px]">/{g.slug}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-border mt-2 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs rounded-lg"
                  onClick={() => openEditModal(g)}
                >
                  <Pencil className="w-3 h-3 mr-1" /> Edit Group
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-red-600"
                  onClick={() => {
                    if (confirm(`Delete group "${g.name}" from live site?`)) {
                      deleteGroup(g.id);
                      toast.success(`Group "${g.name}" deleted.`);
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-background border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display text-foreground">
                {editingGroup ? "Edit Group & Cover Photo" : "Form New Subgroup"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Coders, Aravali Weekend Hikers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    {groupCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Initial Member Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={memberCount}
                    onChange={(e) => setMemberCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="What brings members together, meet times, rules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              {/* Group Image Upload with Live Preview */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Group Cover Photo (Upload or Preset)
                </label>

                {imagePreview && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 border border-border">
                    <img
                      src={imagePreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageUrl("");
                      }}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 text-xs rounded-lg font-medium border border-emerald-500/30 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload from computer
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <span className="text-[11px] text-muted-foreground">or choose a preset:</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {presetImages.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(p.url);
                        setImagePreview(p.url);
                      }}
                      className={`text-[10px] p-1.5 rounded border text-center truncate ${
                        imagePreview === p.url
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingGroup ? "Save Group" : "Form & Publish Group"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
