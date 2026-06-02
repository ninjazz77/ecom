import React, { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUser } from "@/redux/userSlice";
import api from "@/lib/api";
import { ShieldCheck, UserCircle2 } from "lucide-react";

const Profile = () => {
  const { user } = useSelector((store) => store.user);
  const { userId } = useParams();
  const dispatch = useDispatch();
  const activeUserId = userId || user?._id || user?.id;

  const [loading, setLoading] = useState(false);

  const [updateUser, setUpdateUser] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
    profilePic: user?.profilePic || "/dummy.png",
    role: user?.role || "user",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [file, setFile] = useState(null);

  React.useEffect(() => {
    if (!user) return;

    setUpdateUser({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || user?.phoneNo || "",
      address: Array.isArray(user?.address)
        ? user.address.join(", ")
        : user?.address || "",
      city: user?.city || "",
      zipCode: user?.zipCode || "",
      profilePic: user?.profilePic || "/dummy.png",
      role: user?.role || "user",
    });
  }, [user]);

  const handleChange = (e) => {
    setUpdateUser({ ...updateUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUpdateUser({
      ...updateUser,
      profilePic: URL.createObjectURL(selectedFile),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("You are not logged in");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("firstName", updateUser.firstName);
      formData.append("lastName", updateUser.lastName);
      formData.append("email", updateUser.email);
      formData.append("phoneNumber", updateUser.phoneNumber);
      formData.append("address", updateUser.address);
      formData.append("city", updateUser.city);
      formData.append("zipCode", updateUser.zipCode);
      formData.append("role", updateUser.role);

      if (file) {
        formData.append("file", file);
      }

      const res = await api.put(`/user/update/${activeUserId}`, formData, {});

      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setUser(res.data.user));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error("You are not logged in");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(`/user/change-password/${user.email}`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pb-16 pt-28 lg:px-0 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/95 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
              Account center
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              Your profile, preferences, and security controls in one place.
            </h1>
            <div className="mt-6 flex items-center gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/80 p-4">
              <img
                src={updateUser.profilePic}
                alt="profile"
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div>
                <p className="text-lg font-semibold text-white">
                  {updateUser.firstName || "Your account"}
                </p>
                <p className="text-sm text-slate-400">
                  {updateUser.email || user?.email}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/80 p-4">
                <UserCircle2 className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 font-semibold text-white">Profile details</p>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/80 p-4">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 font-semibold text-white">Security</p>
              </div>
            </div>
          </div>

          <Tabs
            defaultValue="profile"
            className="rounded-[2rem] border border-slate-800/70 bg-slate-900/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-800 p-1">
              <TabsTrigger value="profile" className="rounded-full">
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-full">
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
                <Card className="border border-slate-800/70 bg-slate-950/90">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">
                      Profile photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <img
                      src={updateUser.profilePic}
                      alt="profile"
                      className="h-36 w-36 rounded-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-4 ring-cyan-300/20"
                    />

                    <Label
                      htmlFor="profilePic"
                      className="mt-5 cursor-pointer rounded-full bg-cyan-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Change picture
                    </Label>

                    <input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                <Card className="border border-slate-800/70 bg-slate-950/90">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">
                      Personal information
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-200">First Name</Label>
                          <Input
                            name="firstName"
                            value={updateUser.firstName}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label className="text-slate-200">Last Name</Label>
                          <Input
                            name="lastName"
                            value={updateUser.lastName}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label className="text-slate-200">Email</Label>
                          <Input
                            value={updateUser.email}
                            disabled
                            className="bg-slate-900 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-200">Phone Number</Label>
                          <Input
                            name="phoneNumber"
                            value={updateUser.phoneNumber}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label className="text-slate-200">Address</Label>
                          <Input
                            name="address"
                            value={updateUser.address}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label className="text-slate-200">City</Label>
                          <Input
                            name="city"
                            value={updateUser.city}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <Label className="text-slate-200">Zip Code</Label>
                          <Input
                            name="zipCode"
                            value={updateUser.zipCode}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Updating..." : "Update profile"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card className="border border-slate-800/70 bg-slate-950/90">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Change password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="grid gap-4">
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="bg-slate-900 text-white"
                    />
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="New password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="bg-slate-900 text-white"
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="bg-slate-900 text-white"
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
