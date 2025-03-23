import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useTitle } from "../context/TitleContext";
import "./Sidebar.css";

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  path?: string;
  subItems?: { id: string; name: string; count?: number; path?: string }[];
}

const Sidebar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const history = useHistory();
  const { setTitle } = useTitle();

  const menuItems: MenuItem[] = [
    {
      id: "projects",
      name: "Projects & Test Cases",
      icon: "fas fa-folder-tree",
      subItems: [
        {
          id: "web-app",
          name: "Web Application",
          count: 45,
          path: "/projects/web",
        },
        {
          id: "mobile-app",
          name: "Mobile Application",
          count: 32,
          path: "/projects/mobile",
        },
        { id: "api", name: "API Testing", count: 28, path: "/projects/api" },
      ],
    },
    {
      id: "test-management",
      name: "Test Case Management",
      icon: "fas fa-tasks",
      subItems: [
        { id: "all-tests", name: "All Test Cases", path: "/test-cases/all" },
        {
          id: "automated",
          name: "Automated Tests",
          path: "/test-cases/automated",
        },
        { id: "manual", name: "Manual Tests", path: "/test-cases/manual" },
        { id: "generator", name: "Test Cases Generator", path: "/upload" },
      ],
    },
    {
      id: "requirements",
      name: "Requirements Management",
      icon: "fas fa-list-check",
      subItems: [
        {
          id: "functional",
          name: "Functional Requirements",
          path: "/requirements/functional",
        },
        {
          id: "non-functional",
          name: "Non-Functional Requirements",
          path: "/requirements/non-functional",
        },
        { id: "backlog", name: "Backlog Items", path: "/requirements/backlog" },
      ],
    },
    {
      id: "settings",
      name: "Settings",
      icon: "fas fa-gear",
      subItems: [
        { id: "user-settings", name: "User Settings", path: "/settings/user" },
        {
          id: "system-config",
          name: "System Configuration",
          path: "/settings/system",
        },
        {
          id: "integrations",
          name: "Integrations",
          path: "/settings/integrations",
        },
      ],
    },
  ];

  const toggleMenu = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleSubItemClick = (
    path?: string,
    menuName?: string,
    subItemName?: string
  ) => {
    if (path) {
      history.push(path);
      // Set title to only show subItemName
      if (subItemName) {
        setTitle(subItemName);
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <i className="fas fa-cube"></i>
        <h2>Test Manager</h2>
      </div>
      <div className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-section">
            <div
              className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => toggleMenu(item.id)}
            >
              <div className="menu-item-header">
                <i className={item.icon}></i>
                <span>{item.name}</span>
              </div>
              <i
                className={`fas fa-chevron-${
                  activeMenu === item.id ? "down" : "right"
                }`}
              ></i>
            </div>
            {activeMenu === item.id && item.subItems && (
              <div className="submenu">
                {item.subItems.map((subItem) => (
                  <div
                    key={subItem.id}
                    className="submenu-item"
                    onClick={() =>
                      handleSubItemClick(subItem.path, item.name, subItem.name)
                    }
                  >
                    <span>{subItem.name}</span>
                    {subItem.count !== undefined && (
                      <span className="item-count">{subItem.count}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
