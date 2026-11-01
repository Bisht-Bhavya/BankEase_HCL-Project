
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Wallet,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Plus,
  RefreshCw,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
} from "lucide-react";
import heroImage from "../assets/hero.png";

const getAccountsErrorMessage = (err) => {
  console.error("Account loading error:", err);
  return (
    err.response?.data?.message ||
    "Unable to load accounts. Please try again."
  );
};

function AccountCollection({
  accounts,
  loading,
  error,
  onRetry,
  onCreate,
  emptyTitle,
  emptyDescription,
}) {
  if (error) {
    return (
      <div className="dashboard-error" role="alert">
        <span>{error}</span>
        <button type="button" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="account-grid" aria-label="Loading accounts">
        {[0, 1].map((item) => (
          <div className="account-skeleton" key={item}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="empty-accounts">
        <span className="empty-account-icon"><Landmark size={24} /></span>
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>
        <button
          type="button"
          className="create-account-button"
          onClick={onCreate}
        >
          <Plus size={17} />
          Open your first account
        </button>
      </div>
    );
  }

  return (
    <div className="account-grid">
      {accounts.map((account) => (
        <article className="account-card" key={account.id}>
          <div className="account-card-top">
            <span className="account-card-icon"><Wallet size={19} /></span>
            <span
              className={
                account.status === "ACTIVE"
                  ? "status-active"
                  : "status-closed"
              }
            >
              <span aria-hidden="true" />
              {account.status}
            </span>
          </div>
          <p className="account-type-label">
            {account.accountType} ACCOUNT
          </p>
          <h3>
            ₹{Number(account.balance || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
          <div className="account-card-footer">
            <span>Account number</span>
            <strong>{account.accountNumber}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() =>
    JSON.parse(sessionStorage.getItem("user") || "{}")
  );

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountType, setAccountType] = useState("SAVINGS");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [moneyAction, setMoneyAction] = useState("");
  const [actionAccountId, setActionAccountId] = useState("");
  const [recipientAccountId, setRecipientAccountId] = useState("");
  const [actionAmount, setActionAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get("/api/accounts");
      setAccounts(response.data);
      setError("");
    } catch (err) {
      setError(getAccountsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    setCreatingAccount(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      await api.post("/api/accounts", {
        accountType,
      });

      setCreateSuccess(
        `Your ${accountType.toLowerCase()} account was created successfully.`
      );

      // Refresh the account list to show the new account.
      await fetchAccounts();

      // Close the form after a short delay.
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess("");
        setAccountType("SAVINGS");
      }, 1500);
    } catch (err) {
      console.error("Account creation error:", err);

      setCreateError(
        err.response?.data?.message ||
        "Unable to create the account. Please try again."
      );
    } finally {
      setCreatingAccount(false);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    let active = true;
    api.get("/api/accounts")
      .then((response) => {
        if (active) {
          setAccounts(response.data);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(getAccountsErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const refreshAccounts = () => {
    setLoading(true);
    void fetchAccounts();
  };

  const totalBalance = accounts
    .filter((account) => account.status === "ACTIVE")
    .reduce(
      (total, account) => total + Number(account.balance || 0),
      0
    );

  const activeAccounts = accounts.filter(
    (account) => account.status === "ACTIVE"
  );

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const displayName = user.name?.trim().split(/\s+/)[0] || "there";
  const formattedBalance = totalBalance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const openCreateModal = () => {
    setCreateError("");
    setCreateSuccess("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (creatingAccount) return;
    setShowCreateModal(false);
    setCreateError("");
    setCreateSuccess("");
  };

  const activeAccountOptions = activeAccounts;
  const selectedActionAccount =
    activeAccountOptions.find(
      (account) => String(account.id) === actionAccountId
    ) || activeAccountOptions[0];

  const openMoneyAction = (action) => {
    setMoneyAction(action);
    setActionAccountId(String(activeAccountOptions[0]?.id || ""));
    setRecipientAccountId("");
    setActionAmount("");
    setActionError("");
    setActionSuccess("");
  };

  const closeMoneyAction = () => {
    if (actionLoading) return;
    setMoneyAction("");
    setActionError("");
    setActionSuccess("");
  };

  const handleMoneyAction = async (event) => {
    event.preventDefault();
    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      if (moneyAction === "deposit" || moneyAction === "withdraw") {
        await api.post(
          `/api/accounts/${actionAccountId}/${moneyAction}`,
          { amount: Number(actionAmount) }
        );
      } else {
        if (recipientAccountId === actionAccountId) {
          setActionError("Choose a different recipient account.");
          return;
        }

        await api.post("/api/accounts/transfer", {
          senderAccountId: Number(actionAccountId),
          receiverAccountId: Number(recipientAccountId),
          amount: Number(actionAmount),
        });
      }

      const actionLabel = {
        deposit: "Deposit",
        withdraw: "Withdrawal",
        transfer: "Transfer",
      }[moneyAction];
      setActionSuccess(`${actionLabel} completed successfully.`);
      setActionAmount("");
      await fetchAccounts();
    } catch (err) {
      console.error(`${moneyAction} error:`, err);
      setActionError(
        err.response?.data?.message ||
        `Unable to complete the ${moneyAction}. Please check the details and try again.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const moneyActionDetails = {
    deposit: {
      title: "Deposit funds",
      description: "Add funds to one of your active accounts.",
      submit: "Confirm deposit",
      icon: <ArrowDownToLine size={18} />,
    },
    withdraw: {
      title: "Withdraw funds",
      description: "Withdraw funds from one of your active accounts.",
      submit: "Confirm withdrawal",
      icon: <ArrowUpFromLine size={18} />,
    },
    transfer: {
      title: "Transfer money",
      description: "Send money from your account to another BankEase account.",
      submit: "Review transfer",
      icon: <ArrowLeftRight size={18} />,
    },
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link
          className="dashboard-logo"
          to="/dashboard"
          aria-label="BankEase home"
        >
          <span className="dashboard-logo-icon">
            <Wallet size={21} strokeWidth={2.2} />
          </span>
          <span className="dashboard-logo-name">BankEase</span>
        </Link>

        <p className="sidebar-label">YOUR SPACE</p>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <button
            type="button"
            className={activeSection === "overview" ? "active" : ""}
            aria-current={activeSection === "overview" ? "page" : undefined}
            onClick={() => setActiveSection("overview")}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button
            type="button"
            className={activeSection === "accounts" ? "active" : ""}
            aria-current={activeSection === "accounts" ? "page" : undefined}
            onClick={() => setActiveSection("accounts")}
          >
            <CreditCard size={18} />
            My accounts
            {accounts.length > 0 && (
              <span className="nav-count">{accounts.length}</span>
            )}
          </button>
        </nav>

        <div className="sidebar-security">
          <span className="security-indicator">
            <CheckCircle2 size={16} />
          </span>
          <div>
            <strong>Protected banking</strong>
            <span>Your session is secure</span>
          </div>
        </div>

        <div className="sidebar-profile">
          <span className="profile-avatar">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="profile-copy">
            <strong>{user.name || "BankEase user"}</strong>
            <span>{user.email || "Personal account"}</span>
          </span>
          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-subtitle">PERSONAL BANKING</p>
            <h1>Good to see you, {displayName}</h1>
            <p>Your finances, all in one place.</p>
          </div>
          <div className="dashboard-header-actions">
            <span className="secure-session">
              <ShieldCheck size={16} />
              Secure session
            </span>
            <button
              type="button"
              className="refresh-button"
              onClick={refreshAccounts}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "is-spinning" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {activeSection === "overview" && (
          <section className="dashboard-overview" aria-label="Account overview">
            <div className="dashboard-summary">
              <article className="summary-card balance-card">
                <img className="balance-art" src={heroImage} alt="" />
                <div className="balance-card-content">
                  <div className="balance-card-top">
                    <span className="balance-label">
                      <Wallet size={16} />
                      Total balance
                    </span>
                    <button
                      type="button"
                      className="balance-visibility"
                      onClick={() => setBalanceVisible((visible) => !visible)}
                      aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                    >
                      {balanceVisible ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  </div>
                  <h2>
                    {loading
                      ? "Loading..."
                      : balanceVisible
                        ? `₹${formattedBalance}`
                        : "₹ ••••••"}
                  </h2>
                  <span className="balance-caption">
                    Combined balance across active accounts
                  </span>
                </div>
                <span className="balance-card-decoration" aria-hidden="true" />
              </article>

              <article className="summary-card accounts-summary-card">
                <span className="summary-icon">
                  <CreditCard size={19} />
                </span>
                <p>Active accounts</p>
                <h2>{loading ? "—" : activeAccounts.length}</h2>
                <span className="summary-caption">
                  {activeAccounts.length === 1
                    ? "Account ready when you are"
                    : "Accounts ready when you are"}
                </span>
              </article>
            </div>

            <section className="quick-actions" aria-label="Money actions">
              <div>
                <p className="section-eyebrow">MONEY, MADE SIMPLE</p>
                <h2>Quick actions</h2>
              </div>
              <div className="quick-action-buttons">
                <button
                  type="button"
                  className="quick-action-button"
                  onClick={() => openMoneyAction("deposit")}
                  disabled={activeAccountOptions.length === 0}
                >
                  <span className="quick-action-icon deposit-icon">
                    <ArrowDownToLine size={18} />
                  </span>
                  Deposit
                </button>
                <button
                  type="button"
                  className="quick-action-button"
                  onClick={() => openMoneyAction("withdraw")}
                  disabled={activeAccountOptions.length === 0}
                >
                  <span className="quick-action-icon withdraw-icon">
                    <ArrowUpFromLine size={18} />
                  </span>
                  Withdraw
                </button>
                <button
                  type="button"
                  className="quick-action-button"
                  onClick={() => openMoneyAction("transfer")}
                  disabled={activeAccountOptions.length === 0}
                >
                  <span className="quick-action-icon transfer-icon">
                    <ArrowLeftRight size={18} />
                  </span>
                  Transfer
                </button>
              </div>
            </section>

            <div className="accounts-section">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">YOUR BANKING</p>
                  <h2>My accounts</h2>
                  <p>View and manage your BankEase accounts.</p>
                </div>
                <button
                  type="button"
                  className="create-account-button"
                  onClick={openCreateModal}
                >
                  <Plus size={17} />
                  Open an account
                </button>
              </div>

              <AccountCollection
                accounts={accounts}
                loading={loading}
                error={error}
                onRetry={refreshAccounts}
                onCreate={openCreateModal}
                emptyTitle="Your banking starts here"
                emptyDescription="Open your first account to see your balance and account details here."
              />
            </div>
          </section>
        )}

        {activeSection === "accounts" && (
          <section className="accounts-section accounts-page">
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">ACCOUNT MANAGEMENT</p>
                <h2>All accounts</h2>
                <p>Your BankEase accounts and current balances.</p>
              </div>
              <button
                type="button"
                className="create-account-button"
                onClick={openCreateModal}
              >
                <Plus size={17} />
                Open an account
              </button>
            </div>
            <AccountCollection
              accounts={accounts}
              loading={loading}
              error={error}
              onRetry={refreshAccounts}
              onCreate={openCreateModal}
              emptyTitle="No accounts yet"
              emptyDescription="Create an account to start banking with BankEase."
            />
          </section>
        )}

        <footer className="dashboard-footer">
          <span>© {new Date().getFullYear()} BankEase</span>
          <span><ShieldCheck size={14} /> Banking made clear and simple</span>
        </footer>
      </main>

      {showCreateModal && (
        <div className="account-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeCreateModal();
        }}>
          <div
            className="account-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-account-title"
          >
            <div className="account-modal-header">
              <div>
                <span className="modal-icon"><Plus size={19} /></span>
                <h2 id="create-account-title">Open an account</h2>
                <p>Choose the account that best fits your needs.</p>
              </div>
              <button
                type="button"
                className="modal-close-button"
                aria-label="Close dialog"
                disabled={creatingAccount}
                onClick={closeCreateModal}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount}>
              <label htmlFor="accountType">Account type</label>
              <select
                id="accountType"
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
                disabled={creatingAccount}
              >
                <option value="SAVINGS">Savings account</option>
                <option value="CURRENT">Current account</option>
              </select>

              {createError && (
                <div className="dashboard-error" role="alert">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="account-success-message" role="status">
                  <CheckCircle2 size={18} />
                  <span>{createSuccess}</span>
                </div>
              )}
              <div className="account-modal-actions">
                <button
                  type="button"
                  className="cancel-account-button"
                  disabled={creatingAccount}
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-account-button"
                  disabled={creatingAccount || Boolean(createSuccess)}
                >
                  {creatingAccount ? "Opening account..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moneyAction && (
        <div
          className="account-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMoneyAction();
          }}
        >
          <div
            className="account-modal money-action-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="money-action-title"
          >
            <div className="account-modal-header">
              <div>
                <span className={`modal-icon ${moneyAction}-modal-icon`}>
                  {moneyActionDetails[moneyAction].icon}
                </span>
                <h2 id="money-action-title">
                  {moneyActionDetails[moneyAction].title}
                </h2>
                <p>{moneyActionDetails[moneyAction].description}</p>
              </div>
              <button
                type="button"
                className="modal-close-button"
                aria-label="Close dialog"
                disabled={actionLoading}
                onClick={closeMoneyAction}
              >
                <X size={19} />
              </button>
            </div>

            {actionSuccess ? (
              <div className="money-action-result" role="status">
                <span><CheckCircle2 size={21} /></span>
                <strong>{actionSuccess}</strong>
                <p>Your updated balance is reflected on the dashboard.</p>
                <button
                  type="button"
                  className="create-account-button"
                  onClick={closeMoneyAction}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleMoneyAction}>
                <label htmlFor="actionAccount">From account</label>
                <select
                  id="actionAccount"
                  value={selectedActionAccount ? String(selectedActionAccount.id) : ""}
                  onChange={(event) => setActionAccountId(event.target.value)}
                  disabled={actionLoading}
                  required
                >
                  {activeAccountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountType} ···· {account.accountNumber.slice(-4)}
                      {" — "}₹{Number(account.balance || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </option>
                  ))}
                </select>

                {moneyAction === "transfer" && (
                  <>
                    <label htmlFor="recipientAccountId">
                      Recipient account ID
                    </label>
                    <input
                      id="recipientAccountId"
                      className="money-action-input"
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      placeholder="Enter the recipient's account ID"
                      value={recipientAccountId}
                      onChange={(event) => setRecipientAccountId(event.target.value)}
                      disabled={actionLoading}
                      required
                    />
                    <p className="field-hint">
                      Transfers currently use the recipient’s BankEase account ID.
                    </p>
                  </>
                )}

                <label htmlFor="actionAmount">Amount</label>
                <div className="money-amount-input">
                  <span>₹</span>
                  <input
                    id="actionAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={actionAmount}
                    onChange={(event) => setActionAmount(event.target.value)}
                    disabled={actionLoading}
                    required
                  />
                </div>

                {actionError && (
                  <div className="dashboard-error" role="alert">
                    {actionError}
                  </div>
                )}

                <div className="account-modal-actions">
                  <button
                    type="button"
                    className="cancel-account-button"
                    disabled={actionLoading}
                    onClick={closeMoneyAction}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="create-account-button"
                    disabled={
                      actionLoading ||
                      activeAccountOptions.length === 0 ||
                      Boolean(actionSuccess)
                    }
                  >
                    {actionLoading
                      ? "Processing..."
                      : moneyActionDetails[moneyAction].submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
