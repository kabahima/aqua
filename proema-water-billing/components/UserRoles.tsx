import React from 'react';

const rolesData = [
  {
    title: 'Super Admin (Platform)',
    permissions: [
      'Manages tenants (utilities)',
      'Manages global settings',
    ],
  },
  {
    title: 'Utility Admin',
    permissions: [
      'Manages tariffs, routes/zones, users, approvals, and billing cycles',
    ],
  },
  {
    title: 'Billing Officer',
    permissions: [
      'Handles meter reading validation, bill runs, and adjustments',
    ],
  },
  {
    title: 'Cashier/Collections',
    permissions: [
      'Posts payments, reconciles accounts, and processes refunds',
    ],
  },
  {
    title: 'Field Agent',
    permissions: [
      'Captures meter readings, photos, and GPS data',
      'Issues notices to customers',
    ],
  },
  {
    title: 'Customer (Portal/App)',
    permissions: [
      'Views and pays bills online',
      'Lodges complaints or service requests',
      'Can perform self-reading (optional)',
    ],
  },
  {
    title: 'Auditor/Viewer',
    permissions: [
      'Has read-only access to all reports and system logs',
    ],
  },
];

const RoleCard: React.FC<{ title: string; permissions: string[] }> = ({ title, permissions }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
    <ul className="list-disc list-inside space-y-2 text-gray-700">
      {permissions.map((permission, index) => (
        <li key={index}>{permission}</li>
      ))}
    </ul>
  </div>
);


const UserRolesView: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl lg:text-4xl font-bold text-dark mb-8">User Roles & Permissions</h1>
      <p className="text-base sm:text-lg text-gray-600 mb-8">
        This system defines several user roles, each with specific permissions to ensure secure and efficient operation of the water billing platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rolesData.map(role => (
          <RoleCard key={role.title} title={role.title} permissions={role.permissions} />
        ))}
      </div>
    </div>
  );
};

export default UserRolesView;
