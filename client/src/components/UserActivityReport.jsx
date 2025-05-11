import React from 'react';
import { MdDownload } from "react-icons/md";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UserActivityReport = ({ user, onClose }) => {
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const calculateAccountAge = () => {
        if (!user.createdAt) return 'N/A';
        
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months !== 1 ? 's' : ''}`;
        } else {
            const years = Math.floor(diffDays / 365);
            const remainingMonths = Math.floor((diffDays % 365) / 30);
            if (remainingMonths === 0) {
                return `${years} year${years !== 1 ? 's' : ''}`;
            }
            return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        }
    };

    const calculateProfileCompletion = () => {
        const fields = ['name', 'email', 'phone', 'address', 'dob'];
        const filledFields = fields.filter(field => user[field]).length;
        const percentage = Math.round((filledFields / fields.length) * 100);
        return `${percentage}%`;
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Blue color
        doc.text("User Activity Report", 105, 15, { align: "center" });
        
        // Add generation date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: "center" });
        
        // Add profile information
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text("User Profile", 14, 35);
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Name: ${user.name || 'N/A'}`, 14, 45);
        doc.text(`Email: ${user.email || 'N/A'}`, 14, 52);
        doc.text(`Phone: ${user.phone || 'N/A'}`, 14, 59);
        doc.text(`Address: ${user.address || 'N/A'}`, 14, 66);
        doc.text(`Date of Birth: ${user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}`, 14, 73);
        
        // Add activity section
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text("Account Activity", 14, 88);
        
        // Add activity data
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Account Created: ${formatDateTime(user.createdAt)}`, 14, 98);
        doc.text(`Account Age: ${calculateAccountAge()}`, 14, 105);
        doc.text(`First Login: ${formatDateTime(user.firstLogin)}`, 14, 112);
        doc.text(`Last Login: ${formatDateTime(user.lastLogin)}`, 14, 119);
        doc.text(`Last Updated: ${formatDateTime(user.updatedAt)}`, 14, 126);
        
        // Add summary section
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text("Account Summary", 14, 141);
        
        // Create a table with summary data
        const tableColumn = ["Metric", "Value"];
        const tableRows = [
            ["Total Logins", user.firstLogin && user.lastLogin ? "2+" : "N/A"],
            ["Days Since Last Login", user.lastLogin ? `${Math.floor(Math.abs(new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24))}` : "N/A"],
            ["Profile Completion", calculateProfileCompletion()]
        ];
        
        autoTable(doc, {
            startY: 146,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
            styles: { cellPadding: 3 }
        });
        
        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(100);
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
            doc.text("Confidential - For user records only", 105, 290, { align: "center" });
        }
        
        // Save PDF
        doc.save(`${user.name || 'User'}_Activity_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-500">User Activity Report</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={downloadPDF}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                    >
                        <MdDownload size={16} />
                        Download PDF
                    </button>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-semibold"
                        >
                            Close Report
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Account Information</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Account ID:</span>
                            <span className="font-medium">{user._id ? user._id.substring(0, 8) + '...' : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Created:</span>
                            <span className="font-medium">{formatDateTime(user.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Account Age:</span>
                            <span className="font-medium">{calculateAccountAge()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Profile Completion:</span>
                            <span className="font-medium">{calculateProfileCompletion()}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Login Activity</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">First Login:</span>
                            <span className="font-medium">{formatDateTime(user.firstLogin)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Last Login:</span>
                            <span className="font-medium">{formatDateTime(user.lastLogin)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Last Updated:</span>
                            <span className="font-medium">{formatDateTime(user.updatedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Days Since Last Login:</span>
                            <span className="font-medium">
                                {user.lastLogin 
                                    ? Math.floor(Math.abs(new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24))
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserActivityReport;