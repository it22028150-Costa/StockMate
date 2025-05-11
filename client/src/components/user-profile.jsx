import React, { useState, useEffect } from 'react';
import { MdEmail, MdAssessment } from "react-icons/md";
import Swal from 'sweetalert2';
import UserActivityReport from './UserActivityReport'; // Import the UserActivityReport component

const API_URL = 'http://localhost:5000/api/user';

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const [editingField, setEditingField] = useState(null);
    const [errors, setErrors] = useState({});
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [showActivityReport, setShowActivityReport] = useState(false);

    const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
    const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
    
    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (userId && token) {
                    const response = await fetch(`${API_URL}/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch user data');
                    }

                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                alert("Failed to fetch user data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleChange = (e, field) => {
        setUser({ ...user, [field]: e.target.value });
    };

    const handleSave = async () => {
        let newErrors = {};

        // Validate email format
        if (editingField === "email" && !/\S+@\S+\.\S+/.test(user.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        // Validate date of birth for minimum age
        if (editingField === "dob") {
            const dob = new Date(user.dob);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const month = today.getMonth();
            const day = today.getDate();

            if (month < dob.getMonth() || (month === dob.getMonth() && day < dob.getDate())) {
                age--;
            }

            if (age < 18) {
                newErrors.dob = "You must be at least 18 years old.";
            }
        }

        // Validate phone format
        if (editingField === "phone" && user.phone && !/^\+?[0-9]{10,15}$/.test(user.phone)) {
            newErrors.phone = "Invalid phone number format";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        } else {
            setErrors({});
        }

        try {
            // Update user profile using the PUT endpoint
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setEditingField(null);
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile has been updated successfully.',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'bg-blue-500 text-white rounded-lg px-4 py-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                showCancelButton: false,
                showConfirmButton: true,
                focusConfirm: false,
                focusCancel: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                backdrop: 'rgba(0, 0, 0, 0.5)',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                },
                willClose: () => {
                    Swal.hideLoading();
                }
            });
        } catch (error) {
            console.error('Error updating user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update profile. Please try again.',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'bg-red-500 text-white rounded-lg px-4 py-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                showCancelButton: false,
                showConfirmButton: true,
                focusConfirm: false,
                focusCancel: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirmation) {
            setDeleteConfirmation(true);
            return;
        }

        try {
            // Delete user profile using DELETE endpoint
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            // Clear local storage and redirect to login page
            localStorage.removeItem('userId');
            localStorage.removeItem('token'); // If you have a token stored

            Swal.fire({
                icon: 'success',
                title: 'Account Deleted',
                text: 'Your account has been deleted successfully.',
                confirmButtonText: 'OK',
                customClass: {
                    confirmButton: 'bg-blue-500 text-white rounded-lg px-4 py-2',
                },
                buttonsStyling: false,
                showCloseButton: true,
                showCancelButton: false,
                showConfirmButton: true,
                focusConfirm: false,
                focusCancel: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                backdrop: 'rgba(0, 0, 0, 0.5)',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                },
                willClose: () => {
                    Swal.hideLoading();
                }
            });
            window.location.href = '/login'; // Redirect to login page
        } catch (error) {
            console.error('Error deleting user:', error);
            alert("Failed to delete account. Please try again.");
        }
    };

    const handleEditClick = (field) => {
        setEditingField(field);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input
    };

    const fieldLabels = {
        name: "Name",
        email: "Email Address",
        dob: "Date of Birth",
        phone: "Phone Number",
        address: "Address"
    };

    const SkeletonLoading = () => (
        <div className="animate-pulse bg-blue-100/20 h-8 rounded w-full"></div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="rounded-lg border-2 border-blue-200/20 p-6 font-sans">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-500">My Profile</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <MdEmail size={18} className="text-blue-400" />
                            <div className="text-sm">{user.email}</div>
                        </div>
                    </div>
                    <div>
                        <button 
                            onClick={() => setShowActivityReport(!showActivityReport)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                        >
                            <MdAssessment size={16} />
                            {showActivityReport ? "Hide Activity Report" : "View Activity Report"}
                        </button>
                    </div>
                </div>

                {showActivityReport && (
                    <UserActivityReport 
                        user={user} 
                        onClose={() => setShowActivityReport(false)} 
                    />
                )}

                <div className="w-full">
                    {Object.keys(fieldLabels).map((field) => (
                        <div key={field} className="border-b border-blue-200/30 flex justify-between items-center py-4">
                            <span className="text-blue-300 text-base font-semibold w-1/4">
                                {fieldLabels[field]}
                            </span>

                            <div className="text-left flex-grow">
                                {loading ? (
                                    <SkeletonLoading />
                                ) : editingField === field ? (
                                    <div className="flex flex-col">
                                        <input
                                            type={field === "dob" ? "date" : "text"}
                                            value={field === "dob" ? formatDate(user[field]) : (user[field] || "")}
                                            onChange={(e) => handleChange(e, field)}
                                            className={`border p-2 rounded-lg text-base font-normal bg-transparent border-blue-300 ${errors[field] ? 'border-red-500' : ''}`}
                                        />
                                        {errors[field] && <span className="text-red-500 text-xs mt-1">{errors[field]}</span>}
                                    </div>
                                ) : field === "dob" && user[field] ? (
                                    <div className="text-base font-normal">
                                        {new Date(user[field]).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div className="text-base font-normal">{user[field] || ""}</div>
                                )}
                            </div>

                            <button
                                className="text-blue-500 text-base font-semibold hover:text-blue-600 transition-colors"
                                onClick={() => (editingField === field ? handleSave() : handleEditClick(field))}
                            >
                                {editingField === field ? "Save" : "Edit"}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border-t border-blue-200/30 pt-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-blue-500">Account Actions</h2>

                        {deleteConfirmation ? (
                            <div className="flex items-center gap-4">
                                <span className="text-red-500">Are you sure?</span>
                                <button
                                    onClick={() => setDeleteConfirmation(false)}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDeleteUser}
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                            >
                                Delete Account
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;