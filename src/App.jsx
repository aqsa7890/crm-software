import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'salespulse-crm-v1';

const initialContacts = [
  { id: 1, name: 'Alicia Thompson', email: 'alicia@northstar.co', company: 'Northstar Labs', phone: '+1 (415) 230-9912', status: 'Customer' },
  { id: 2, name: 'Marcus Lee', email: 'marcus@brightpath.io', company: 'BrightPath', phone: '+1 (510) 903-2185', status: 'Lead' },
  { id: 3, name: 'Priya Nair', email: 'priya@harborhq.com', company: 'Harbor HQ', phone: '+1 (646) 778-2231', status: 'Customer' },
  { id: 4, name: 'James Ortega', email: 'james@lumenworks.ai', company: 'LumenWorks', phone: '+1 (212) 565-1180', status: 'Active' },
];

const initialDeals = [
  { id: 1, client: 'Northstar Labs', value: 24000, stage: 'Proposal', owner: 'Sarah', probability: 70 },
  { id: 2, client: 'BrightPath', value: 31500, stage: 'Negotiation', owner: 'Daniel', probability: 85 },
  { id: 3, client: 'Harbor HQ', value: 42000, stage: 'Closed Won', owner: 'Sarah', probability: 100 },
  { id: 4, client: 'LumenWorks', value: 18200, stage: 'Prospecting', owner: 'Alicia', probability: 28 },
];

const initialTasks = [
  { id: 1, title: 'Schedule onboarding call', owner: 'Sarah', due: '2026-11-04', status: 'In Progress', priority: 'High' },
  { id: 2, title: 'Prepare Q4 proposal for BrightPath', owner: 'Daniel', due: '2026-11-03', status: 'To Do', priority: 'High' },
  { id: 3, title: 'Review customer feedback summary', owner: 'Alicia', due: '2026-11-05', status: 'Completed', priority: 'Medium' },
  { id: 4, title: 'Update CRM pipeline notes', owner: 'Team', due: '2026-11-06', status: 'To Do', priority: 'Low' },
];

const initialActivities = [
  { id: 1, title: 'New deal created', detail: 'BrightPath moved to negotiation', time: '2 hours ago' },
  { id: 2, title: 'Task updated', detail: 'Onboarding call scheduled for Northstar', time: '5 hours ago' },
  { id: 3, title: 'Contact added', detail: 'James Ortega joined LumenWorks', time: 'Yesterday' },
  { id: 4, title: 'Pipeline summary', detail: 'Closed-won revenue reached $42K this month', time: '2 days ago' },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'deals', label: 'Deals' },
  { id: 'tasks', label: 'Tasks' },
];

const stageOrder = ['Prospecting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getDefaultState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      contacts: initialContacts,
      deals: initialDeals,
      tasks: initialTasks,
      activities: initialActivities,
    };
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {
      contacts: initialContacts,
      deals: initialDeals,
      tasks: initialTasks,
      activities: initialActivities,
    };
  }
}

export default function App() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState(() => getDefaultState().contacts);
  const [deals, setDeals] = useState(() => getDefaultState().deals);
  const [tasks, setTasks] = useState(() => getDefaultState().tasks);
  const [activities, setActivities] = useState(() => getDefaultState().activities);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        contacts,
        deals,
        tasks,
        activities,
      })
    );
  }, [contacts, deals, tasks, activities]);

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.company, contact.status]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [contacts, search]);

  const activeDeals = deals.filter((deal) => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost');
  const totalRevenue = deals
    .filter((deal) => deal.stage === 'Closed Won')
    .reduce((sum, deal) => sum + deal.value, 0);

  const totalPipeline = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
  const openTasks = tasks.filter((task) => task.status !== 'Completed').length;
  const customers = contacts.filter((contact) => contact.status === 'Customer').length;

  const addContact = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const contact = {
      id: Date.now(),
      name: form.get('name'),
      email: form.get('email'),
      company: form.get('company'),
      phone: form.get('phone'),
      status: form.get('status') || 'Lead',
    };

    setContacts((current) => [contact, ...current]);
    setActivities((current) => [
      {
        id: Date.now(),
        title: 'Contact added',
        detail: `${contact.name} added to ${contact.company}`,
        time: 'Just now',
      },
      ...current,
    ]);
    event.currentTarget.reset();
  };

  const addDeal = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const deal = {
      id: Date.now(),
      client: form.get('client'),
      value: Number(form.get('value')) || 0,
      stage: form.get('stage') || 'Prospecting',
      owner: form.get('owner') || 'Sales Team',
      probability: Number(form.get('probability')) || 50,
    };

    setDeals((current) => [deal, ...current]);
    setActivities((current) => [
      {
        id: Date.now(),
        title: 'New deal created',
        detail: `${deal.client} entered ${deal.stage}`,
        time: 'Just now',
      },
      ...current,
    ]);
    event.currentTarget.reset();
  };

  const addTask = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const task = {
      id: Date.now(),
      title: form.get('title'),
      owner: form.get('owner') || 'Sales Team',
      due: form.get('due') || new Date().toISOString().slice(0, 10),
      status: form.get('status') || 'To Do',
      priority: form.get('priority') || 'Medium',
    };

    setTasks((current) => [task, ...current]);
    setActivities((current) => [
      {
        id: Date.now(),
        title: 'Task added',
        detail: `${task.title} assigned to ${task.owner}`,
        time: 'Just now',
      },
      ...current,
    ]);
    event.currentTarget.reset();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-mark">S</div>
          <div>
            <h1>SalesPulse</h1>
            <span>CRM Suite</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={selectedTab === item.id ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setSelectedTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-panel">
          <p className="panel-title">Performance</p>
          <div className="mini-stat">
            <strong>{formatCurrency(totalPipeline)}</strong>
            <span>Pipeline</span>
          </div>
          <div className="mini-stat">
            <strong>{customers}</strong>
            <span>Customers</span>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>{selectedTab === 'dashboard' ? 'Dashboard' : selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}</h2>
          </div>

          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search contacts..."
            />
          </div>
        </header>

        {selectedTab === 'dashboard' && (
          <>
            <section className="stats-grid">
              <div className="stat-card accent-blue">
                <span>Total Revenue</span>
                <strong>{formatCurrency(totalRevenue)}</strong>
                <small>Closed-won this quarter</small>
              </div>
              <div className="stat-card accent-green">
                <span>Open Pipeline</span>
                <strong>{formatCurrency(totalPipeline)}</strong>
                <small>{activeDeals.length} active deals</small>
              </div>
              <div className="stat-card accent-purple">
                <span>Open Tasks</span>
                <strong>{openTasks}</strong>
                <small>Requires attention</small>
              </div>
              <div className="stat-card accent-orange">
                <span>Customers</span>
                <strong>{customers}</strong>
                <small>Active accounts</small>
              </div>
            </section>

            <section className="overview-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Deal pipeline</h3>
                  <span>{deals.length} deals</span>
                </div>

                <div className="deal-columns">
                  {stageOrder.map((stage) => {
                    const stageDeals = deals.filter((deal) => deal.stage === stage);
                    return (
                      <div key={stage} className="deal-column">
                        <h4>{stage}</h4>
                        {stageDeals.length ? (
                          stageDeals.map((deal) => (
                            <div key={deal.id} className="deal-card">
                              <div className="deal-head">
                                <strong>{deal.client}</strong>
                                <span>{deal.probability}%</span>
                              </div>
                              <p>{formatCurrency(deal.value)}</p>
                              <small>{deal.owner}</small>
                            </div>
                          ))
                        ) : (
                          <p className="empty-state">No deals</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Recent activity</h3>
                </div>
                <ul className="activity-list">
                  {activities.slice(0, 5).map((activity) => (
                    <li key={activity.id}>
                      <strong>{activity.title}</strong>
                      <p>{activity.detail}</p>
                      <span>{activity.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        {selectedTab === 'contacts' && (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel-header">
                <h3>Contacts</h3>
                <span>{filteredContacts.length} results</span>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>{contact.name}</td>
                        <td>{contact.company}</td>
                        <td>
                          <span className={`badge ${contact.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td>{contact.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel form-panel">
              <div className="panel-header">
                <h3>Add contact</h3>
              </div>

              <form onSubmit={addContact} className="crm-form">
                <input name="name" type="text" placeholder="Full name" required />
                <input name="email" type="email" placeholder="Email" required />
                <input name="company" type="text" placeholder="Company" required />
                <input name="phone" type="tel" placeholder="Phone" required />
                <select name="status" defaultValue="Lead">
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Customer">Customer</option>
                </select>
                <button type="submit">Save contact</button>
              </form>
            </div>
          </section>
        )}

        {selectedTab === 'deals' && (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel-header">
                <h3>Sales pipeline</h3>
                <span>{deals.length} total</span>
              </div>

              <div className="deal-list">
                {deals.map((deal) => (
                  <div key={deal.id} className="deal-row">
                    <div>
                      <strong>{deal.client}</strong>
                      <small>{deal.owner}</small>
                    </div>
                    <span>{deal.stage}</span>
                    <strong>{formatCurrency(deal.value)}</strong>
                    <em>{deal.probability}%</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel form-panel">
              <div className="panel-header">
                <h3>Add deal</h3>
              </div>

              <form onSubmit={addDeal} className="crm-form">
                <input name="client" type="text" placeholder="Client name" required />
                <input name="value" type="number" placeholder="Deal value" min="0" required />
                <select name="stage" defaultValue="Prospecting">
                  {stageOrder.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <input name="owner" type="text" placeholder="Sales owner" required />
                <input name="probability" type="number" placeholder="Probability %" min="0" max="100" required />
                <button type="submit">Add deal</button>
              </form>
            </div>
          </section>
        )}

        {selectedTab === 'tasks' && (
          <section className="two-column-layout">
            <div className="panel">
              <div className="panel-header">
                <h3>Tasks</h3>
                <span>{tasks.length} items</span>
              </div>

              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-main">
                      <strong>{task.title}</strong>
                      <small>{task.owner}</small>
                    </div>
                    <div className="task-meta">
                      <span className={`badge ${task.status.toLowerCase().replace(/\s+/g, '-')}`}>{task.status}</span>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span>{task.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel form-panel">
              <div className="panel-header">
                <h3>Create task</h3>
              </div>

              <form onSubmit={addTask} className="crm-form">
                <input name="title" type="text" placeholder="Task title" required />
                <input name="owner" type="text" placeholder="Owner" required />
                <input name="due" type="date" required />
                <select name="status" defaultValue="To Do">
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <select name="priority" defaultValue="Medium">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <button type="submit">Save task</button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
