import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { User, Shield, Camera, Save, Lock, MapPin, Mail, Phone } from "lucide-react";
import { setUser } from "@/redux/userSlice";
import api from "@/lib/api";

const TAB = { PROFILE: "profile", SECURITY: "security" };

const Profile = () => {
  const { user }   = useSelector((s) => s.user);
  const { userId } = useParams();
  const dispatch   = useDispatch();
  const activeId   = userId || user?._id || user?.id;

  const [tab, setTab]       = useState(TAB.PROFILE);
  const [loading, setLoading] = useState(false);
  const [file, setFile]     = useState(null);

  const [form, setForm] = useState({
    firstName:   user?.firstName   || "",
    lastName:    user?.lastName    || "",
    email:       user?.email       || "",
    phoneNumber: user?.phoneNumber || "",
    address:     Array.isArray(user?.address) ? user.address.join(", ") : user?.address || "",
    city:        user?.city        || "",
    zipCode:     user?.zipCode     || "",
    profilePic:  user?.profilePic  || "/dummy.png",
    role:        user?.role        || "user",
  });

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  React.useEffect(() => {
    if (!user) return;
    setForm({
      firstName:   user.firstName   || "",
      lastName:    user.lastName    || "",
      email:       user.email       || "",
      phoneNumber: user.phoneNumber || user.phoneNo || "",
      address:     Array.isArray(user.address) ? user.address.join(", ") : user.address || "",
      city:        user.city        || "",
      zipCode:     user.zipCode     || "",
      profilePic:  user.profilePic  || "/dummy.png",
      role:        user.role        || "user",
    });
  }, [user]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setForm((p) => ({ ...p, profilePic: URL.createObjectURL(f) }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("accessToken")) { toast.error("Not logged in"); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      ["firstName","lastName","email","phoneNumber","address","city","zipCode","role"].forEach((k) => fd.append(k, form[k]));
      if (file) fd.append("file", file);
      const res = await api.put(`/user/update/${activeId}`, fd);
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success("Profile updated ✨");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    } finally { setLoading(false); }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (!user?.email) { toast.error("Not logged in"); return; }
    try {
      setLoading(true);
      const res = await api.post(`/user/change-password/${user.email}`, pwForm);
      if (res.data.success) {
        toast.success("Password changed ✨");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to change password");
    } finally { setLoading(false); }
  };

  const FIELDS = [
    { name: "firstName",   label: "First Name",    icon: User,  type: "text",  placeholder: "John",            half: true },
    { name: "lastName",    label: "Last Name",     icon: User,  type: "text",  placeholder: "Doe",             half: true },
    { name: "phoneNumber", label: "Phone",         icon: Phone, type: "tel",   placeholder: "+91 9876543210",  half: true },
    { name: "city",        label: "City",          icon: MapPin,type: "text",  placeholder: "Mumbai",          half: true },
    { name: "address",     label: "Address",       icon: MapPin,type: "text",  placeholder: "123 Main St",     half: false },
    { name: "zipCode",     label: "ZIP / Pincode", icon: MapPin,type: "text",  placeholder: "400001",          half: true },
  ];

  return (
    <div className="min-h-screen bg-bg text-white pt-20">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/6 py-14 px-4 lg:px-6">
        <div className="glow-orb w-80 h-80 bg-violet-700 -top-40 right-0 opacity-20" />
        <div className="relative z-10 mx-auto max-w-5xl flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-3xl overflow-hidden ring-2 ring-violet-500/40">
              <img src={form.profilePic} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center cursor-pointer hover:scale-110 transition">
              <Camera className="h-3.5 w-3.5 text-white" />
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </div>
          <div>
            <span className="section-label text-violet-400">Account Center</span>
            <h1 className="font-display text-4xl text-white mt-1">
              {form.firstName || "Your"} {form.lastName || "Profile"}
            </h1>
            <p className="text-sm text-white/40 mt-1 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              {form.email || user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 glass inline-flex rounded-3xl p-1.5 w-fit">
          {[{ id: TAB.PROFILE, icon: User, label: "Profile" }, { id: TAB.SECURITY, icon: Shield, label: "Security" }].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition ${
                tab === id
                  ? "bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-white border border-violet-500/25"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === TAB.PROFILE && (
          <form onSubmit={submitProfile} className="animate-fade-up">
            <div className="glass rounded-4xl p-8">
              <h2 className="font-display text-2xl text-white mb-7">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {FIELDS.map(({ name, label, icon: Icon, type, placeholder, half }) => (
                  <div key={name} className={`space-y-1.5 ${!half ? "sm:col-span-2" : ""}`}>
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/35">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </label>
                    <input
                      name={name} type={type} value={form[name]}
                      onChange={(e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
                      placeholder={placeholder}
                      className="input-dark w-full"
                    />
                  </div>
                ))}

                {/* Email (disabled) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/35">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <input
                    value={form.email} disabled
                    className="input-dark w-full opacity-40 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" disabled={loading} className="btn-glow disabled:opacity-50">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {tab === TAB.SECURITY && (
          <form onSubmit={submitPassword} className="animate-fade-up">
            <div className="glass rounded-4xl p-8 max-w-lg">
              <div className="flex items-center gap-3 mb-7">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-display text-2xl text-white">Change Password</h2>
              </div>
              <div className="space-y-4">
                {[
                  { name: "currentPassword", label: "Current Password" },
                  { name: "newPassword",     label: "New Password" },
                  { name: "confirmPassword", label: "Confirm New Password" },
                ].map(({ name, label }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/35">{label}</label>
                    <input
                      name={name} type="password" value={pwForm[name]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
                      placeholder="••••••••"
                      className="input-dark w-full"
                    />
                  </div>
                ))}
                <button type="submit" disabled={loading} className="btn-glow w-full justify-center py-3 disabled:opacity-50 mt-2">
                  {loading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <><Shield className="h-4 w-4" /> Update Password</>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
