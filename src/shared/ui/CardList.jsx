import { useState } from "react";
import { Link, useNavigate } from "react-router";
import LoadingSpinner from "@/src/shared/feedback/LoadingSpinner.jsx";
import "./CardList.css";

/**
 * CardList - A reusable component for displaying lists of items (workouts, templates, plans)
 * with configurable actions and card rendering.
 * 
 * @param {Array} items - Array of items to display
 * @param {string} itemType - Type of items: "workout" | "template" | "plan"
 * @param {Object} cardFields - Field mapping configuration for card content
 * @param {Function} renderCard - Optional custom card renderer function
 * @param {Object} actions - Actions configuration object
 * @param {Function} onAction - Callback for action handling (actionKey, item) => {}
 * @param {Function|string} detailPath - Path or function to generate detail path
 * @param {string} createPath - Path to create new item
 * @param {string} createLabel - Label for create button
 * @param {string} scope - Current scope filter ("user" | "public" | "all")
 * @param {Function} onScopeChange - Callback when scope changes
 * @param {string} layout - Layout type: "grid" | "list" (default: "grid")
 * @param {Object} emptyState - Empty state configuration
 * @param {boolean} loading - Loading state
 * @param {string|null} error - Error message
 * @param {string} title - List title
 * @param {boolean} showCreateButton - Show create button (default: true)
 * @param {Object} user - Current user object for permission checks
 */
const CardList = ({
  items = [],
  itemType,
  cardFields,
  renderCard,
  actions = {},
  onAction,
  detailPath,
  createPath,
  createLabel = "+ New Item",
  scope,
  onScopeChange,
  layout = "grid",
  emptyState,
  loading = false,
  error = null,
  title,
  showCreateButton = true,
  user,
}) => {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState({});

  // Check if user owns an item
  const isOwner = (item) => {
    if (!user || !item) return false;
    const ownerId = typeof item.user === "object" ? item.user?.id : item.user;
    return Number(ownerId) === Number(user.id);
  };

  // Get visible actions for an item based on permissions
  const getVisibleActions = (item) => {
    return Object.entries(actions).filter(([, config]) => {
      // Always visible actions
      if (config.alwaysVisible) return true;

      // Check ownership requirement
      if (config.requiresOwnership && !isOwner(item)) return false;

      // Check custom condition
      if (config.condition && !config.condition(item, user)) return false;

      return true;
    });
  };

  // Handle action click
  const handleActionClick = async (actionKey, item, event) => {
    event?.preventDefault();
    event?.stopPropagation();

    const actionConfig = actions[actionKey];
    if (!actionConfig) return;

    // Handle navigation actions
    if (actionConfig.path) {
      const path = typeof actionConfig.path === "function" 
        ? actionConfig.path(item) 
        : actionConfig.path;
      navigate(path);
      return;
    }

    // Handle custom actions (delete, generate, etc.)
    if (actionConfig.action && onAction) {
      // Check for confirmation
      if (actionConfig.requiresConfirmation) {
        const message = actionConfig.confirmationMessage || 
          `Are you sure you want to ${actionConfig.label.toLowerCase()}?`;
        const confirmed = window.confirm(message);
        if (!confirmed) return;
      }

      // Set loading state for this specific action
      setActionLoading({ ...actionLoading, [`${actionKey}-${item.id}`]: true });

      try {
        await onAction(actionConfig.action, item);
      } catch (err) {
        console.error(`Error executing action ${actionKey}:`, err);
      } finally {
        setActionLoading({ ...actionLoading, [`${actionKey}-${item.id}`]: false });
      }
    }
  };

  // Render card using field mapping
  const renderCardFromFields = (item) => {
    if (!cardFields) return null;

    const fields = Object.entries(cardFields);
    return (
      <div className="card-list__card-body">
        {fields.map(([fieldKey, fieldConfig]) => {
          const content = fieldConfig.render(item);
          if (!content && fieldConfig.optional) return null;

          return (
            <div key={fieldKey} className={`card-list__card-${fieldKey}`}>
              {fieldKey === "title" && detailPath ? (
                <Link
                  to={typeof detailPath === "function" ? detailPath(item) : detailPath}
                  className="card-list__card-link"
                  onClick={(e) => {
                    // Don't navigate if clicking on action buttons
                    if (e.target.closest(".card-list__card-actions")) {
                      e.preventDefault();
                    }
                  }}
                >
                  {content}
                </Link>
              ) : (
                <span>{content}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render action buttons/menu
  const renderActions = (item) => {
    const visibleActions = getVisibleActions(item);
    if (visibleActions.length === 0) return null;

    return (
      <div className="card-list__card-actions">
        {visibleActions.map(([actionKey, actionConfig]) => {
          const isLoading = actionLoading[`${actionKey}-${item.id}`];
          const isDisabled = isLoading || actionConfig.disabled?.(item, user);

          if (actionConfig.path) {
            return (
              <Link
                key={actionKey}
                to={typeof actionConfig.path === "function" 
                  ? actionConfig.path(item) 
                  : actionConfig.path}
                className="card-list__card-action"
                onClick={(e) => e.stopPropagation()}
              >
                {actionConfig.icon && <span>{actionConfig.icon} </span>}
                {actionConfig.label}
              </Link>
            );
          }

          return (
            <button
              key={actionKey}
              className="card-list__card-action-button"
              onClick={(e) => handleActionClick(actionKey, item, e)}
              disabled={isDisabled}
              aria-busy={isLoading}
              aria-label={
                isLoading ? `${actionConfig.label} (loading)` : undefined
              }
            >
              {isLoading ? (
                <LoadingSpinner
                  variant="inline"
                  size="sm"
                  ariaLive="off"
                  decorative
                />
              ) : (
                <>
                  {actionConfig.icon && <span>{actionConfig.icon} </span>}
                  {actionConfig.label}
                </>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // Render individual card
  const renderItemCard = (item) => {
    const cardContent = renderCard 
      ? renderCard(item, { isOwner: isOwner(item), user })
      : renderCardFromFields(item);

    if (!cardContent) return null;

    const hasClickableCard = detailPath && !actions.view;

    return (
      <div
        key={item.id}
        className={`card-list__card ${hasClickableCard ? "card-list__card--clickable" : ""}`}
        onClick={hasClickableCard ? () => {
          const path = typeof detailPath === "function" ? detailPath(item) : detailPath;
          navigate(path);
        } : undefined}
      >
        {cardContent}
        {renderActions(item)}
      </div>
    );
  };

  // Render scope switcher (if provided)
  const renderScopeSwitcher = () => {
    if (!onScopeChange || !scope) return null;

    const scopes = [
      { value: "user", label: "My Items" },
      { value: "public", label: "Public" },
      { value: "all", label: "All" },
    ];

    return (
      <div className="card-list__scope-switcher">
        {scopes.map((s) => (
          <button
            key={s.value}
            className={`card-list__scope-button ${scope === s.value ? "card-list__scope-button--active" : ""}`}
            onClick={() => onScopeChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="card-list">
        {title && <h2 className="card-list__title">{title}</h2>}
        <LoadingSpinner message="Loading…" variant="default" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card-list">
        {title && <h2 className="card-list__title">{title}</h2>}
        <p className="card-list__error" style={{ color: "crimson" }}>{error}</p>
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    const emptyConfig = emptyState || {
      title: `No ${itemType}s found`,
      message: `You haven't created any ${itemType}s yet.`,
      action: createPath ? { label: `Create your first ${itemType}`, path: createPath } : null,
    };

    return (
      <div className="card-list">
        {title && (
            <div className="card-list__header">
                {title && <h2 className="card-list__title">{title}</h2>}
                <div className="card-list__header-actions">
                    {renderScopeSwitcher()}
                    {showCreateButton && createPath && (
                    <Link to={createPath} className="card-list__create-btn">
                        {createLabel}
                    </Link>
                    )}
                </div>
            </div>
        )}
        <div className="card-list__empty">
          <h3>{emptyConfig.title}</h3>
          {emptyConfig.message && <p>{emptyConfig.message}</p>}
          {emptyConfig.action && (
            <Link to={emptyConfig.action.path} className="card-list__create-btn">
              {emptyConfig.action.label}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="card-list">
      {/* Header */}
      <div className="card-list__header">
        {title && <h2 className="card-list__title">{title}</h2>}
        <div className="card-list__header-actions">
          {renderScopeSwitcher()}
          {showCreateButton && createPath && (
            <Link to={createPath} className="card-list__create-btn">
              {createLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Grid/List */}
      <div className={`card-list__container card-list__container--${layout}`}>
        {items.map((item) => renderItemCard(item))}
      </div>
    </div>
  );
};

export default CardList;