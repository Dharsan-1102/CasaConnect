import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './CSS/Navbar.css';
import DefaultAvatar from '../assets/default-avatar.png';

const Navbar = () => {
  const [name, setName] = useState('User');
  const [userPhoto, setUserPhoto] = useState(DefaultAvatar);
  const [role, setRole] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({ users: false });
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  const isCreatePath = [
    '/admin/add-society',
    '/admin/add-apartment',
    '/admin/add-flat',
    '/admin/accept-residents',
    '/admin/add-amenities',
    '/admin/users/create',
    '/admin/users/existing',
    '/admin/add-bill'
  ].some(path => location.pathname.startsWith(path));

  const getActiveCreatePath = () => {
    const path = location.pathname;

    if (path.startsWith('/admin/users/create')) return 'Users → Create New User';
    if (path.startsWith('/admin/users/existing')) return 'Users → Existing Users';
    if (path.startsWith('/admin/add-society')) return 'Add Society';
    if (path.startsWith('/admin/add-apartment')) return 'Add Apartment';
    if (path.startsWith('/admin/add-flat')) return 'Add Flat';
    if (path.startsWith('/admin/accept-residents')) return 'Accept Residents';
    if (path.startsWith('/admin/add-amenities')) return 'Add Amenities';
    if (path.startsWith('/admin/add-bill')) return 'Add Bill';

    return '';
  };


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;
        setName(user.name || 'User');
        setRole(user.role);
        setUserPhoto(user.profile_photo_url || DefaultAvatar);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCreateDropdown(false);
        setSubmenuOpen({ users: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <h2>CasaConnect</h2>
      <nav>
        <NavLink
          to={role === 'admin' ? '/admin' : role === 'resident' ? '/resident' : role === 'maintenance' ? '/maintenance-dashboard' : role === 'guard' ? '/guard-dashboard' : '/'}
          className={({ isActive }) => (isActive && !isCreatePath ? 'active-link' : '')}
        >
          Home
        </NavLink>

        {role === 'admin' || role === 'resident' ? (
          <>
            <NavLink to="/maintenance" className={({ isActive }) => isActive ? 'active-link' : ''}>Maintenance</NavLink>
            <NavLink to="/amenities" className={({ isActive }) => isActive ? 'active-link' : ''}>Amenities</NavLink>
            <NavLink to="/bills" className={({ isActive }) => isActive ? 'active-link' : ''}>Bills</NavLink>
          </>
        ) : role === 'maintenance' ? (
          <NavLink to="/maintenance" className={({ isActive }) => isActive ? 'active-link' : ''}>Maintenance</NavLink>
        ) : role === 'guard' ? (
          <NavLink to="/visitors" className={({ isActive }) => isActive ? 'active-link' : ''}>Visitors</NavLink>
        ) : null}

        {role === 'admin' && (
          <>
            <NavLink to="/visitors" className={({ isActive }) => isActive ? 'active-link' : ''}>Visitors</NavLink>

            <div className="nav-item dropdown" ref={dropdownRef}>
              <div
                className={`dropdown-toggle ${isCreatePath || showCreateDropdown ? 'active-link' : ''}`}
                onClick={() => setShowCreateDropdown(prev => !prev)}
              >
                Create {getActiveCreatePath() && `→ ${getActiveCreatePath()}`}
              </div>

              {showCreateDropdown && (
                <ul className="dropdown-menu">
                  <li>
                    <div
                      className={`submenu-toggle ${submenuOpen.users ? 'open' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSubmenuOpen(prev => ({ ...prev, users: !prev.users }));
                      }}
                    >
                      Users
                    </div>

                    {submenuOpen.users && (
                      <ul className="submenu-column">
                        <li>
                          <NavLink to="/admin/users/create" className={({ isActive }) => isActive ? 'active-link' : ''}>
                            Create New User
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/admin/users/existing" className={({ isActive }) => isActive ? 'active-link' : ''}>
                            Existing Users
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li><NavLink to="/admin/add-society">Add Society</NavLink></li>
                  <li><NavLink to="/admin/add-apartment">Add Apartment</NavLink></li>
                  <li><NavLink to="/admin/add-flat">Add Flat</NavLink></li>
                  <li><NavLink to="/admin/accept-residents">Accept Residents</NavLink></li>
                  <li><NavLink to="/admin/add-amenities">Add Amenities</NavLink></li>
                  <li><NavLink to="/admin/add-bill">Add Bill</NavLink></li>
                </ul>
              )}
            </div>
          </>
        )}
      </nav>

      <div className="profile-section" onClick={() => setShowProfileMenu(!showProfileMenu)}>
        <img src={userPhoto} alt="Profile" className="profile-image" />
        <span className="profile-name">{name}</span>
        {showProfileMenu && (
          <div className="profile-dropdown">
            <button onClick={() => navigate('/profile')}>View Profile</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
