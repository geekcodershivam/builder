# builder

This template should help get you started developing with Vue 3 in Vite.

## Tech Stack

- Vue 3
- TypeScript
- Pinia
- VueFlow
- vee-validate
- Zod
- Vite
- Tailwind CSS

---

## 📁 Folder Structure

```
builder/
├── src/
│   ├── components/
│   │   ├── Canvas.vue                    # Main VueFlow canvas
│   │   ├── Sidebar.vue                   # Node palette
│   │   ├── ExecutionPanel.vue            # Execution logs
│   │   ├── NodeConfig/               # Node config components
│   │   │       ├── EmailConfig.vue
│   │   │       ├── SmsConfig.vue
│   │   │       ├── HttpConfig.vue
│   │   │       ├── WebhookConfig.vue
│   │   │       ├── ConditionConfig.vue
│   │   │       └── TransformConfig.vue
│   │   ├── NodeConfig/ 
│   │   │   ├── NodeConfigPanel.vue       # Main config panel
│   │   │   ├── useNodeForm.ts
│   │   │   ├── registry.ts               # Component registry
│   │   │   └── schemas/                  # Zod validation schemas
│   │   │       ├── email.schema.ts
│   │   │       ├── sms.schema.ts
│   │   │       ├── http.schema.ts
│   │   │       ├── webhook.schema.ts
│   │   │       ├── condition.schema.ts
│   │   │       └── transform.schema.ts
│   │   │  
│   │   └── nodes/
│   │       └── CustomNode.vue            # Custom node component
│   │
│   ├── stores/
│   │   └── workflowStore.ts              # Main Pinia store
│   │
│   ├── schemas/                          # Zod validation schemas
│   │   ├── email.schema.ts                 
│   │   ├── sms.schema.ts                  
│   │   ├── http.schema.ts
│   │   ├── condition.schema.ts
│   │   ├── transform.schema.ts                  
│   │   └── webhook.schema.ts              
│   │
│   ├── utils/                            # Modular utilities
│   │   ├── validation.ts                 # Validation logic
│   │   ├── execution.ts                  # Execution engine
│   │   ├── persistence.ts                # Storage operations
│   │   └── history.ts                    # Undo/redo system
│   ├── types/
│   │   └── workflow.ts                   # TypeScript definitions
│   │
│   ├── constants/
│   │   └── nodeTypes.ts                  # Node type definitions
│   │
│   ├── App.vue                           # Root component
│   └── main.ts                           # App entry point
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                             # This file
```

## Architecture Overview

![alt text](<art.png>)

---

### Data Flow

```

 User Action (Type in field)
          ↓
 v-model updates field (vee-validate)
          ↓
 useField() detects change
          ↓
 Parent Form fires @values-change
          ↓
 handleValuesChange() called
          ↓
 store.updateNode()
    ├─→ saveToHistory() (undo/redo)
    └─→ saveWorkflow() (localStorage)
          ↓
    Data persisted!

```

---

## 🗃️ State Management

### State Shape

```typescript
// Main Store State
{
  // Workflow data
  nodes: WorkflowNode[]           // All nodes in workflow
  edges: WorkflowEdge[]           // Connections between nodes
  selectedNode: WorkflowNode | null  // Currently selected node
  
  // History for undo/redo
  historyState: {
    snapshots: WorkflowSnapshot[]  // Array of state snapshots
    currentIndex: number           // Current position in history
  }
  
  // Execution state
  executionState: {
    isRunning: boolean             // Is workflow executing?
    isPaused: boolean              // Is execution paused?
    currentNodeId: string | null   // Currently executing node
    logs: ExecutionLog[]           // Execution logs
    nodeStatuses: {                // Status of each node
      [nodeId: string]: 'running' | 'success' | 'error'
    }
  }
}
```

### WorkflowNode Type

```typescript
interface WorkflowNode {
  id: string                       // Unique ID (node_timestamp_random)
  type: 'custom'                   // VueFlow node type
  position: { x: number; y: number }  // Canvas position
  data: {
    label: string                  // Node name (e.g., "Send Email")
    nodeType: 'trigger' | 'action' | 'logic'  // Node category
    icon: string                   // Emoji icon
    config: Record    // Node configuration
  }
}
```

### WorkflowEdge Type

```typescript
interface WorkflowEdge {
  id: string                       // Unique ID (edge_timestamp_random)
  source: string                   // Source node ID
  target: string                   // Target node ID
  type: 'smoothstep'               // Edge type
  animated: boolean                // Is edge animated?
  label?: string                   // Optional edge label
}
```

### localStorage Schema

```typescript
// Key: 'workflow'
{
  nodes: WorkflowNode[]            // All nodes
  edges: WorkflowEdge[]            // All edges
  timestamp: number                // Last save time
}
```


---

## How to Add a Node Type

### Overview
Adding a new node type means teaching the system about a new action it can perform (like sending a Slack message, making an API call, etc.)

### The 5 Steps

#### 1. Define the Node
**What you do:**
- Give it a name (e.g., "Slack Message")
- Choose an icon (e.g., 💬)
- Set the category (Trigger, Action, or Logic)
- Write a description
- Set default values for configuration

**What happens:**
- Node appears in the sidebar palette
- Users can drag it onto the canvas

---

#### 2. Create Validation Schema
**What you do:**
- List all the fields this node needs (channel, message, etc.)
- Define rules for each field:
  - Is it required?
  - What format? (email, URL, phone number)
  - Minimum/maximum length?
  - Custom rules? (must start with #, must be positive number)

**What happens:**
- Users get real-time error messages as they type
- Invalid data is caught immediately
- Form knows what to accept and reject

---

#### 3. Build the Configuration Component
**What you do:**
- Create a form with input fields
- Add labels for each field
- Connect fields to the validation schema
- Add error message displays

**What happens:**
- When user clicks the node, this form appears
- Users can configure the node's settings
- Validation happens automatically as they type

---

#### 4. Register Everything
**What you do:**
- Connect the node name to its configuration component
- Connect the component to its validation schema
- Tell the system this node needs validation

**What happens:**
- System knows which form to show when node is clicked
- System knows how to validate this node
- All pieces work together automatically

---

#### 5. Add Pre-Execution Validator
**What you do:**
- Write checks that run before workflow executes
- Verify all required fields are filled
- Check data formats are correct
- Ensure configuration is complete

**What happens:**
- Before running, system checks all nodes
- If errors found, execution is prevented
- User sees list of what needs to be fixed

---

### Why 5 Steps?

**Separation of Concerns:**
- Each step has one clear purpose
- Easy to test each part independently
- Changes in one step don't affect others

**Reusability:**
- Components can be reused
- Validation schemas are portable
- Patterns are consistent

**Scalability:**
- Adding 10 more nodes is just as easy
- No need to modify existing nodes
- System grows cleanly

---

### The Complete Flow

**When you add a node:**
1. You define it → System knows it exists
2. You create schema → System knows what's valid
3. You build UI → System knows how to show it
4. You register it → System connects everything
5. You add validator → System can check it

**When user uses it:**
1. User drags from sidebar → Node appears on canvas
2. User clicks node → Config panel opens
3. User types in fields → Validation runs in real-time
4. User saves → Data goes to store and localStorage
5. User runs workflow → Pre-execution validation checks everything

---

### Time Investment

- **Simple node** (like "Delay" with one field): 2 minutes
- **Medium node** (like "Slack" with 3 fields): 5 minutes
- **Complex node** (like "Database Query" with many fields): 10 minutes

---

## How Undo/Redo Works

### The Core Concept

**Snapshot System:**
- Every time you make a significant change, the system saves a complete "snapshot"
- A snapshot is a photograph of your entire workflow at that moment
- Snapshots are stored in a timeline array
- System tracks which snapshot you're currently viewing

### What is a Snapshot?

**Contains:**
- All nodes (with their positions)
- All connections between nodes
- All configuration data
- Complete workflow state

**Think of it like:**
- A save point in a video game
- A version in version control
- A frame in a video
- A photograph of your work

---

### The Timeline

**Structure:**
- An ordered list of snapshots
- A pointer showing "you are here"
- Can move pointer left (undo) or right (redo)

**Example:**
- Snapshot 1: Empty canvas
- Snapshot 2: Added Email node
- Snapshot 3: Configured Email node
- Snapshot 4: Added SMS node
- Snapshot 5: Connected Email to SMS
- Current position: Snapshot 5

---

### How Undo Works

**What happens when you press Ctrl+Z:**
1. System moves the pointer one position left in the timeline
2. Gets the snapshot at that position
3. Replaces current workflow with that snapshot
4. Updates the canvas to show the old state
5. Previous work isn't deleted, just hidden

**Example:**
- You're at Snapshot 5
- Press Ctrl+Z
- Pointer moves to Snapshot 4
- Workflow restores to how it looked at Snapshot 4
- The SMS connection disappears
- But Snapshot 5 still exists (for redo)

**Important:**
- You can undo up to 50 times
- Nothing is actually deleted during undo
- You can always redo to get back

---

### How Redo Works

**What happens when you press Ctrl+Shift+Z:**
1. System moves the pointer one position right in the timeline
2. Gets the snapshot at that position
3. Replaces current workflow with that snapshot
4. Updates the canvas to show the newer state
5. Work that was undone reappears

**Example:**
- You're at Snapshot 4 (after undo)
- Press Ctrl+Shift+Z
- Pointer moves to Snapshot 5
- Workflow restores to how it looked at Snapshot 5
- The SMS connection reappears
- You're back to where you started

---

### Undo/Redo System -> How It Works

```
Initial State:
snapshots: [A, B, C]
currentIndex: 2  (at C)

User adds node:
snapshots: [A, B, C, D]  ← New snapshot added
currentIndex: 3  (at D)

User undoes:
snapshots: [A, B, C, D]  (unchanged)
currentIndex: 2  (at C)  ← Index decremented
→ State restored to C

User makes change after undo:
snapshots: [A, B, E]  ← C and D removed, E added
currentIndex: 2  (at E)
```


### When Snapshots Are Created

**Every significant action creates a snapshot:**
- Adding a node
- Deleting a node
- Moving a node
- Connecting nodes
- Disconnecting nodes
- Changing node configuration
- Duplicating a node
- Importing a workflow

**These do NOT create snapshots:**
- Just selecting a node
- Opening a config panel
- Hovering over nodes
- Zooming the canvas
- Panning around
- Reading node data

**Why this distinction?**
- Only meaningful changes should be in history
- Too many snapshots makes history cluttered
- Keeps undo/redo useful and predictable

---

### The 50-Snapshot Limit

**Why limit to 50?**
- Each snapshot stores the complete workflow
- Unlimited history would use too much memory
- 50 snapshots is plenty for normal use
- Keeps the app fast and responsive

**What happens at 51?**
- When you make the 51st change
- The oldest snapshot (Snapshot 1) is deleted
- New snapshot is added at the end
- You now have Snapshots 2 through 51

**Practical impact:**
- You can still undo 50 times
- Oldest changes eventually fall off
- Most users never hit this limit
- Prevents memory issues

---

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
