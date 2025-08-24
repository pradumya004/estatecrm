import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Home,
  Edit,
  Camera,
  Save,
  X,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
  Trophy,
  TrendingUp,
  Shield,
  Crown,
  Building,
  Globe,
  ArrowUpRight,
  Link as LinkIcon,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { authAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import { formatToTitleCase } from "../../utils/formatters";

// Helper function to format large numbers
const formatCurrency = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount?.toLocaleString("en-IN")}`;
};

const AgentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getProfile();
      console.log("Profile data:", response.data);

      setProfile(response.data);
      setFormData(response.data); // Initialize form data for editing
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load your profile. Please try again later.");
      toast.error("Could not fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamically generate achievements based on real performance data
  const achievements = useMemo(() => {
    const generatedAchievements = [];
    if (!profile?.performance) return [];

    const { totalDeals, totalDealValue, convertedLeads, totalLeads } =
      profile.performance;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    if (totalDeals >= 50) {
      generatedAchievements.push({
        id: 1,
        title: "Deal Master",
        description: "Closed 50+ deals",
        icon: Crown,
        color: "text-yellow-600 bg-yellow-100",
      });
    }
    if (totalDealValue >= 50000000) {
      // 5 Crore
      generatedAchievements.push({
        id: 2,
        title: "Revenue Rainmaker",
        description: "Generated ₹5 Cr+ in revenue",
        icon: DollarSign,
        color: "text-green-600 bg-green-100",
      });
    }
    if (conversionRate >= 25) {
      generatedAchievements.push({
        id: 3,
        title: "Conversion King",
        description: `Achieved ${conversionRate.toFixed(1)}% conversion rate`,
        icon: UserCheck,
        color: "text-blue-600 bg-blue-100",
      });
    }
    if (profile.teamMembers?.length > 5) {
      generatedAchievements.push({
        id: 4,
        title: "Team Leader",
        description: `Managing a team of ${profile.teamMembers.length}`,
        icon: Users,
        color: "text-purple-600 bg-purple-100",
      });
    }

    return generatedAchievements;
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const [field, subfield] = name.split(".");

    if (subfield) {
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subfield]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    const toastId = toast.loading("Updating profile...");
    try {
      // The API should handle which fields are updatable by the user
      const { firstName, lastName, phone, address } = formData;
      const updateData = { firstName, lastName, phone, address };

      const response = await authAPI.updateProfile(profile._id, updateData);
      setProfile(response.data.agent);
      setFormData(response.data.agent);
      setEditing(false);
      toast.success("Profile updated successfully!", { id: toastId });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile.", {
        id: toastId,
      });
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile); // Reset changes
    setEditing(false);
  };

  // UI Components
  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    prefix = "",
    suffix = "",
  }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div
          className={`p-3 rounded-lg ${color} group-hover:scale-105 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div
            className={`flex items-center text-sm font-semibold ${
              change > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-800">
          {prefix}
          {value}
          {suffix}
        </p>
        <p className="text-gray-500 text-sm mt-1">{title}</p>
      </div>
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="border border-gray-200 rounded-md p-4">
      <label className="text-xs font-semibold text-gray-500 uppercase">
        {label}
      </label>
      <div className="flex items-center space-x-3 mt-2">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className="text-gray-800 text-sm">{value || "N/A"}</span>
      </div>
    </div>
  );

  const EditableInfoItem = ({ icon: Icon, label, name, value }) => (
    <div className="border border-gray-200 rounded-md p-4">
      <label
        htmlFor={name}
        className="text-xs font-semibold text-gray-500 uppercase"
      >
        {label}
      </label>
      <div className="flex items-center space-x-3 mt-2 relative border border-gray-300 rounded-md">
        <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          id={name}
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          className="w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  if (loading)
    return <div className="text-center py-20">Loading profile...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!profile)
    return <div className="text-center py-20">No profile data found.</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Your professional dashboard and personal information.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <>
              <button onClick={handleCancelEdit} className="btn-secondary">
                <X className="w-4 h-4 mr-2" /> Cancel
              </button>
              <button onClick={handleSaveProfile} className="btn-primary">
                <Save className="w-4 h-4 mr-2" /> Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={
                  profile.profileImage?.url ||
                  `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=0ea5e9&color=fff&size=128`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
              />
              {editing && (
                <button className="absolute bottom-0 right-0 p-2 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors shadow-md">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {profile.fullName}
              </h2>
              <p className="text-gray-300 text-md">{profile.designation}</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  profile.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {profile.status
                  ? profile.status.charAt(0).toUpperCase() +
                    profile.status.slice(1)
                  : "Unknown"}
              </span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 text-center md:text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-gray-300 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold">
                {profile.conversionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex space-x-1 md:space-x-4 px-4 border-b border-gray-200">
          {[
            { id: "overview", label: "Overview", icon: User },
            { id: "performance", label: "Performance", icon: TrendingUp },
            { id: "achievements", label: "Achievements", icon: Trophy },
            { id: "team", label: "My Team", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 p-3 md:p-4 border-b-2 text-sm md:text-md font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <tab.icon className="w-5 h-5" /> <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Column 1: Contact Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Contact & Location
                </h3>
                {!editing ? (
                  <>
                    <InfoItem icon={Mail} label="Email" value={profile.email} />
                    <InfoItem
                      icon={Phone}
                      label="Phone"
                      value={profile.phone}
                    />
                    <InfoItem
                      icon={MapPin}
                      label="Address"
                      value={
                        profile.address
                          ? `${profile.address.street}, ${profile.address.city},  ${profile.address.state}`
                          : "N/A"
                      }
                    />
                    <InfoItem
                      icon={Building}
                      label="Branch"
                      value={profile.branch}
                    />
                    <InfoItem
                      icon={Globe}
                      label="Region"
                      value={profile.region}
                    />
                  </>
                ) : (
                  <>
                    <EditableInfoItem
                      icon={Phone}
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                    />
                    <EditableInfoItem
                      icon={MapPin}
                      label="Street"
                      name="address.street"
                      value={formData.address?.street}
                    />
                    <EditableInfoItem
                      icon={MapPin}
                      label="City"
                      name="address.city"
                      value={formData.address?.city}
                    />
                    <EditableInfoItem
                      icon={MapPin}
                      label="State"
                      name="address.state"
                      value={formData.address?.state}
                    />
                  </>
                )}
              </div>
              {/* Column 2: Professional Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Professional Details
                </h3>
                <InfoItem icon={Shield} label="Role" value={formatToTitleCase(profile.role)} />
                <InfoItem
                  icon={Briefcase}
                  label="Department"
                  value={profile.department}
                />
                <InfoItem
                  icon={UserPlus}
                  label="Reports To"
                  value={profile.reportsTo?.fullName || "N/A"}
                />
                <InfoItem
                  icon={Calendar}
                  label="Joining Date"
                  value={new Date(profile.joiningDate).toLocaleDateString()}
                />
                <InfoItem
                  icon={Clock}
                  label="Last Login"
                  value={
                    profile.lastLogin
                      ? new Date(profile.lastLogin).toLocaleString()
                      : "Never"
                  }
                />
              </div>
              {/* Column 3: Specializations */}
              <div className="space-y-6 md:col-span-2 lg:col-span-1">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Areas of Expertise
                </h3>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">
                    Specializations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations?.length > 0 ? (
                      profile.specializations.map((spec, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {spec}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">
                        No specializations listed.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">
                    Operating Areas
                  </h4>
                  <div className="space-y-2">
                    {profile.operatingAreas?.length > 0 ? (
                      profile.operatingAreas.map((area, i) => (
                        <div key={i} className="text-xs">
                          <strong className="font-medium">{area.city}:</strong>{" "}
                          {area.areas.join(", ")}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">
                        No operating areas listed.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "performance" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard
                title="Total Leads"
                value={profile.performance?.totalLeads || 0}
                icon={Users}
                color="bg-blue-500"
                change={12}
              />
              <MetricCard
                title="Converted Leads"
                value={profile.performance?.convertedLeads || 0}
                icon={UserCheck}
                color="bg-cyan-500"
                change={9}
              />
              <MetricCard
                title="Deals Closed"
                value={profile.performance?.totalDeals || 0}
                icon={Trophy}
                color="bg-green-500"
                change={5}
              />
              <MetricCard
                title="Revenue Generated"
                value={formatCurrency(profile.performance?.totalDealValue || 0)}
                icon={DollarSign}
                color="bg-purple-500"
                change={15}
              />
            </div>
          )}
          {activeTab === "achievements" &&
            (achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {achievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div
                      key={ach.id}
                      className="text-center bg-gray-50 p-6 rounded-xl border border-gray-200"
                    >
                      <div
                        className={`w-16 h-16 rounded-full ${ach.color} mx-auto mb-4 flex items-center justify-center`}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-gray-800">{ach.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {ach.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Trophy className="mx-auto w-12 h-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-800">
                  No Achievements Yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Keep up the great work to unlock new achievements!
                </p>
              </div>
            ))}
          {activeTab === "team" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                Team Members ({profile.teamMembers?.length || 0})
              </h3>
              {profile.teamMembers && profile.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="bg-white p-4 rounded-lg border border-gray-200 flex items-center space-x-4"
                    >
                      <img
                        src={
                          member.profileImage?.url ||
                          `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}`
                        }
                        alt={member.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.designation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users className="mx-auto w-12 h-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    You do not have any team members assigned to you.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;
