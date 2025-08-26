// estatecrm/src/components/admin/AgentForm.jsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  AlertCircle,
  Building,
  Shield,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
} from "lucide-react";

// RBAC Infrastructure
import { useAuth } from "../../hooks/useAuth.js";
import PermissionGate from "../common/PermissionGate.jsx";
import {
  BRANCHES,
  REGIONS,
  SPECIALIZATIONS,
} from "../../utils/rbacConstants.js";
import agentService from "../../services/agent.service.js";
import { adminAPI } from "../../services/api.js";
import { formatToTitleCase } from "../../utils/formatters.js";
import { useRBAC } from "../../hooks/useRBAC.js";

// --- HELPER COMPONENTS ---

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  error,
  options,
  optionValueKey,
  optionLabelKey,
  disabled = false,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && "*"}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
        error ? "border-red-500" : "border-gray-300"
      } ${disabled ? "bg-gray-100" : ""}`}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option[optionValueKey]} value={option[optionValueKey]}>
          {option[optionLabelKey]}
        </option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

const CheckboxField = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-200"
    />
    <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
      {label}
    </label>
  </div>
);

const AgentForm = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const rbac = useRBAC(user);
  const isEditing = !!agentId;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    designation: "",
    reportsTo: "",
    teamMembers: [],
    branch: "",
    region: "",
    profileImage: "",
    joiningDate: new Date().toISOString().split("T")[0],
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    specializations: [],
    operatingAreas: [
      {
        city: "",
        areas: "",
      },
    ],
    status: "active",
    isVerified: false,
    needsActivation: true,
  });

  const [loading, setLoading] = useState({
    form: isEditing,
    submit: false,
    uiData: true,
  });
  const [errors, setErrors] = useState({});

  // State for dynamic data fetched from backend
  const [allRoles, setAllRoles] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);

  // State for image handling
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Fetch data required for the form UI (roles, departments, managers)
  useEffect(() => {
    const fetchUiData = async () => {
      try {
        const [rolesRes, deptsRes, managersRes] = await Promise.all([
          adminAPI.getAllRoles(),
          adminAPI.getAllDepartments(),
          agentService.getAgents({ limit: 200 }),
        ]);
        console.log("UI data fetched:", rolesRes, deptsRes, managersRes);

        setAllRoles(rolesRes.data.roles || []);
        setAllDepartments(deptsRes.data.departments || []);
        setAvailableManagers(managersRes.agents || []);
      } catch (err) {
        console.error("Failed to fetch UI data:", err);
        setErrors((prev) => ({
          ...prev,
          uiData: "Could not load form options.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, uiData: false }));
      }
    };
    fetchUiData();
  }, []);

  // Fetch existing agent data if in "edit" mode
  useEffect(() => {
    if (isEditing && agentId) {
      const fetchAgentData = async () => {
        try {
          const response = await agentService.getAgent(agentId);
          const agent = response.agent;
          if (agent) {
            setFormData({
              firstName: agent.firstName || "",
              lastName: agent.lastName || "",
              email: agent.email || "",
              phone: agent.phone || "",
              role: agent.role?._id || "",
              department: agent.department?._id || "",
              designation: agent.designation || "",
              reportsTo: agent.reportsTo?._id || "",
              teamMembers: agent.teamMembers || [],
              branch: agent.branch || "",
              region: agent.region || "",
              profileImage: agent.profileImage?.url || "",
              joiningDate: agent.joiningDate
                ? new Date(agent.joiningDate).toISOString().split("T")[0]
                : "",
              address: agent.address || {
                street: "",
                city: "",
                state: "",
                pincode: "",
              },
              specializations: agent.specializations || [],
              operatingAreas: agent.operatingAreas?.length
                ? agent.operatingAreas.map((area) => ({
                    ...area,
                    areas: Array.isArray(area.areas)
                      ? area.areas.join(", ")
                      : "",
                  }))
                : [{ city: "", areas: "" }],
              status: agent.status || "active",
              isVerified: agent.isVerified || false,
              needsActivation:
                agent.needsActivation !== undefined
                  ? agent.needsActivation
                  : true,
            });
            if (agent.profileImage?.url) {
              setImagePreview(agent.profileImage.url);
            }
          }
        } catch (error) {
          console.error("Failed to fetch agent data:", error);
          setErrors((prev) => ({
            ...prev,
            fetch: "Failed to load agent data.",
          }));
        } finally {
          setLoading((prev) => ({ ...prev, form: false }));
        }
      };
      fetchAgentData();
    }
  }, [isEditing, agentId]);

  // Filter roles that the current user is allowed to assign
  const assignableRoles = useMemo(() => {
    // console.log("All roles:", allRoles);

    if (!user || !Array.isArray(allRoles) || !rbac) return [];
    const assignableRoleNames = rbac.getAssignableRolesList(allRoles);
    // console.log("Assignable roles:", assignableRoleNames);

    return allRoles
      .filter((role) => assignableRoleNames.includes(role.name))
      .map((role) => ({
        ...role,
        name: formatToTitleCase(role.name),
      }));
  }, [allRoles, rbac, user]);

  // Departments Formatted
  const formattedDepartments = useMemo(() => {
    return allDepartments.map((department) => ({
      ...department,
      name: formatToTitleCase(department.name),
    }));
  });

  // Get the list of designations for the currently selected department
  const designationsForSelectedDept = useMemo(() => {
    if (!formData.department || !Array.isArray(allDepartments)) return [];
    const selectedDept = allDepartments.find(
      (d) => d._id === formData.department
    );
    return selectedDept?.designations || [];
  }, [formData.department, allDepartments]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [parent, child] = name.split(".");
    const val = type === "checkbox" ? checked : value;

    if (child) {
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: val },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }

    if (name === "department") {
      setFormData((prev) => ({ ...prev, designation: "" }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSpecializationChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const { specializations } = prev;
      const newSpecializations = checked
        ? [...specializations, value]
        : specializations.filter((s) => s !== value);
      return { ...prev, specializations: newSpecializations };
    });
  };

  const handleOperatingAreaChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAreas = [...formData.operatingAreas];
    updatedAreas[index][name] = value;
    setFormData((prev) => ({ ...prev, operatingAreas: updatedAreas }));
  };

  const addOperatingArea = () => {
    setFormData((prev) => ({
      ...prev,
      operatingAreas: [...prev.operatingAreas, { city: "", areas: "" }],
    }));
  };

  const removeOperatingArea = (index) => {
    const updatedAreas = formData.operatingAreas.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, operatingAreas: updatedAreas }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Only image files are allowed",
        }));
        return;
      }
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.designation)
      newErrors.designation = "Designation is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading((prev) => ({ ...prev, submit: true }));

    const agentData = {
      ...formData,
      reportsTo: formData.reportsTo === "" ? null : formData.reportsTo,
    };

    try {
      const result = isEditing
        ? await agentService.updateAgent(agentId, agentData)
        : await agentService.createAgent(agentData);

      const currentAgentId = result.agent?._id || agentId;

      if (profileImageFile && currentAgentId) {
        await agentService.uploadAgentImage(currentAgentId, profileImageFile);
      }

      navigate("/admin/agents");
    } catch (error) {
      console.error("Error saving agent:", error);
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to save agent.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  //   console.log("Agent Form UI Data:");
  console.log("Assignable Roles:", assignableRoles);
  //   console.log("All Departments:", allDepartments);
  //   console.log("Available Managers:", availableManagers);

  if (loading.form || loading.uiData) {
    return <div>Loading Form...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/agents")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Agent" : "Add New Agent"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Update agent information"
                : "Create a new team member"}
            </p>
          </div>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border shadow-sm p-6 space-y-8 divide-y divide-gray-200"
      >
        {/* Profile Image & Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="relative inline-block">
              <img
                src={
                  imagePreview ||
                  `https://placehold.co/96x96/E2E8F0/4A5568?text=${
                    formData.firstName[0] || "A"
                  }`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            {errors.image && (
              <p className="text-red-600 text-sm mt-2 text-center">
                {errors.image}
              </p>
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                required
              />
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                required
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
              />
              <InputField
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleInputChange}
              />
              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { _id: "active", name: "Active" },
                  { _id: "inactive", name: "Inactive" },
                  { _id: "suspended", name: "Suspended" },
                ]}
                optionValueKey="_id"
                optionLabelKey="name"
              />
            </div>
          </div>
        </div>

        {/* ROLE & DEPARTMENT */}
        <PermissionGate permissions={["MANAGE_TEAM_MEMBERS"]} user={user}>
          <div className="space-y-4 pt-8">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Role & Department
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                error={errors.role}
                options={assignableRoles}
                optionValueKey="_id"
                optionLabelKey="name"
                required
              />
              <SelectField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                error={errors.department}
                options={formattedDepartments}
                optionValueKey="_id"
                optionLabelKey="name"
                required
              />
              <SelectField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                error={errors.designation}
                options={designationsForSelectedDept.map((d) => ({ name: d }))}
                optionValueKey="name"
                optionLabelKey="name"
                disabled={!formData.department}
                required
              />
              <SelectField
                label="Reports To"
                name="reportsTo"
                value={formData.reportsTo}
                onChange={handleInputChange}
                options={availableManagers}
                optionValueKey="_id"
                optionLabelKey="fullName"
              />
              <SelectField
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                options={BRANCHES}
                optionValueKey="value"
                optionLabelKey="label"
              />
              <SelectField
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                options={REGIONS}
                optionValueKey="value"
                optionLabelKey="label"
              />
              {isEditing && formData.teamMembers?.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Team Members
                  </label>
                  <ul className="space-y-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                    {formData.teamMembers.map((member) => (
                      <li
                        key={member._id}
                        className="p-1"
                      >{`${member.firstName} ${member.lastName}`}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </PermissionGate>

        {/* ADDRESS */}
        <div className="space-y-4 pt-8">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              error={errors.street}
            />
            <InputField
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              error={errors.city}
            />
            <InputField
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              error={errors.state}
            />
            <InputField
              label="Pincode"
              name="address.pincode"
              value={formData.address.pincode}
              onChange={handleInputChange}
              error={errors.pincode}
            />
          </div>
        </div>

        {/* SPECIALIZATIONS & OPERATING AREAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Specializations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {SPECIALIZATIONS.map((spec) => (
                <CheckboxField
                  key={spec.value}
                  label={spec.label}
                  name={spec.value}
                  checked={formData.specializations.includes(spec.value)}
                  onChange={() =>
                    handleSpecializationChange({
                      target: {
                        value: spec.value,
                        checked: !formData.specializations.includes(spec.value),
                      },
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Operating Areas
            </h3>
            <div className="space-y-3">
              {formData.operatingAreas.map((area, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    <InputField
                      label="City"
                      name="city"
                      value={area.city}
                      onChange={(e) => handleOperatingAreaChange(index, e)}
                    />
                    <InputField
                      label="Areas"
                      name="areas"
                      value={area.areas}
                      onChange={(e) => handleOperatingAreaChange(index, e)}
                      placeholder="Comma-separated areas"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOperatingArea(index)}
                    className="mt-8 p-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOperatingArea}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Operating Area
              </button>
            </div>
          </div>
        </div>

        {/* ACCOUNT STATUS */}
        <PermissionGate permissions={["MANAGE_TEAM_MEMBERS"]}>
          <div className="space-y-4 pt-8">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Account Status
            </h3>
            <div className="flex space-x-6">
              <CheckboxField
                label="Is Verified"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleInputChange}
              />
              <CheckboxField
                label="Needs Activation"
                name="needsActivation"
                checked={formData.needsActivation}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </PermissionGate>

        {/* FORM ACTIONS */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/agents")}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading.submit}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading.submit
              ? "Saving..."
              : isEditing
              ? "Update Agent"
              : "Create Agent"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentForm;
