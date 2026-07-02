import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NotificationItem {
  id: string;
  role: string;
  message: string;
  icon: string;
  timeAgo: string;
  read: boolean;
}

interface MessageItem {
  id: string;
  sender: string;
  recipient: string;
  title: string;
  body: string;
  timestamp: string;
  readBy: string[]; // roles that have read this message
  expanded?: boolean;
}

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.css'
})
export class DashboardHeader implements OnInit {
  private authService = inject(AuthService);

  @Input() role = '';
  @Input() userName = '';
  @Input() email = '';
  @Input() profileImage = '';



  // Maps backend role enums to display strings used in notifications/filters
  private readonly roleDisplayMap: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    DISTRIBUTOR: 'Distributor',
    MERCHANT: 'Merchant',
  };

  ngOnInit() {
    // ── Step 1: Show defaults from localStorage immediately (no API wait) ──
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
        this.email = user.email ?? '';
        this.role = this.roleDisplayMap[user.role] ?? user.role ?? '';
      } catch {
        const storedRole = localStorage.getItem('userRole') ?? '';
        this.role = this.roleDisplayMap[storedRole] ?? storedRole;
      }
    } else {
      const storedRole = localStorage.getItem('userRole') ?? '';
      this.role = this.roleDisplayMap[storedRole] ?? storedRole;
    }

    // ── Step 2: Refresh from API in background (updates if data changed) ──
    this.authService.getMe().subscribe({
      next: (res) => {
        this.userName = `${res.data.firstName} ${res.data.lastName}`;
        this.email = res.data.email;
        this.role = this.roleDisplayMap[res.data.role] ?? res.data.role;
      },
      error: (err) => {
        console.error('Could not refresh user from /me:', err);
        // silently keep the localStorage values already shown
      }
    });

    // Global click listener to close dropdowns on outer clicks
    window.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile') && !target.closest('.profile-dropdown')) {
        this.isProfileOpen = false;
      }
      if (!target.closest('.notification') && !target.closest('.notifications-dropdown') && !target.closest('.all-notifications-modal')) {
        this.isNotificationsOpen = false;
      }
    });
  }













  private router = inject(Router);

  // Toggle Panel States
  isMessagesOpen = false;
  isNotificationsOpen = false;
  isProfileOpen = false;

  // Modals States
  isPasswordModalOpen = false;
  isAllNotificationsModalOpen = false;
  isAvatarModalOpen = false;

  // Change Password Form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Avatar Selection Form
  uploadedFileName = '';
  uploadedBase64 = '';
  presetAvatars: string[] = [
    'https://i.pravatar.cc/150?img=12', // Vishwas Gour (Super Admin / default)
    'https://i.pravatar.cc/150?img=47', // Sahil Gour (Merchant / default)
    'https://i.pravatar.cc/150?img=33',
    'https://i.pravatar.cc/150?img=56',
    'https://i.pravatar.cc/150?img=60',
    'https://i.pravatar.cc/150?img=68'
  ];
  selectedAvatar = '';

  // Announcement Form (Super Admin only)
  announcementTitle = '';
  announcementBody = '';
  announcementTarget = 'All'; // 'All' | 'All Distributors' | 'Merchant:Sahil Gour'
  activeMessagesTab: 'history' | 'send' = 'history';

  // State Lists
  allNotifications: NotificationItem[] = [];
  allMessages: MessageItem[] = [];

  loadData() {
    // 0. Load Avatar
    const savedAvatar = localStorage.getItem('vexaro_avatar_' + this.role);
    if (savedAvatar) {
      this.profileImage = savedAvatar;
    }

    // 1. Load Notifications
    const storedNotifications = localStorage.getItem('vexaro_notifications');
    if (storedNotifications) {
      this.allNotifications = JSON.parse(storedNotifications);
    } else {
      const defaultNotifications: NotificationItem[] = [
        // Super Admin
        { id: 'sa-1', role: 'Super Admin', message: 'New distributor wallet topup request: Distributor D101 requested ₹50,000 topup', icon: 'account_balance_wallet', timeAgo: '5 mins ago', read: false },
        { id: 'sa-2', role: 'Super Admin', message: 'Weight dispute escalated for shipment AWB9082', icon: 'gavel', timeAgo: '2 hours ago', read: false },
        { id: 'sa-3', role: 'Super Admin', message: 'New distributor (Vexaro East) has registered', icon: 'person_add', timeAgo: '1 day ago', read: true },

        // Distributor
        { id: 'dist-1', role: 'Distributor', message: 'Merchant Sahil Gour created a shipment (AWB8801)', icon: 'local_shipping', timeAgo: '10 mins ago', read: false },
        { id: 'dist-2', role: 'Distributor', message: 'Weight dispute raised on shipment AWB8802 by Sahil Gour', icon: 'gavel', timeAgo: '1 hour ago', read: false },
        { id: 'dist-3', role: 'Distributor', message: 'Your wallet was topped up by ₹1,00,000 by Super Admin', icon: 'account_balance_wallet', timeAgo: '4 hours ago', read: true },
        { id: 'dist-4', role: 'Distributor', message: 'Merchant Sahil Gour requested a wallet topup of ₹10,000', icon: 'account_balance_wallet', timeAgo: '5 hours ago', read: true },

        // Merchant
        { id: 'merch-1', role: 'Merchant', message: 'Your shipment AWB8801 has been picked up', icon: 'local_shipping', timeAgo: '15 mins ago', read: false },
        { id: 'merch-2', role: 'Merchant', message: 'Your shipment AWB8801 has been delivered successfully', icon: 'check_circle', timeAgo: '3 hours ago', read: false },
        { id: 'merch-3', role: 'Merchant', message: 'Weight dispute raised by courier on shipment AWB8802', icon: 'gavel', timeAgo: '5 hours ago', read: false },
        { id: 'merch-4', role: 'Merchant', message: 'Your wallet has been topped up by ₹10,000 by Distributor', icon: 'account_balance_wallet', timeAgo: '1 day ago', read: true },
        { id: 'merch-5', role: 'Merchant', message: 'COD of ₹4,500 has been released to your wallet for shipment AWB8801', icon: 'account_balance_wallet', timeAgo: '2 days ago', read: true }
      ];
      this.allNotifications = defaultNotifications;
      this.saveNotifications();
    }

    // 2. Load Messages/Announcements
    const storedMessages = localStorage.getItem('vexaro_messages');
    if (storedMessages) {
      this.allMessages = JSON.parse(storedMessages);
    } else {
      const defaultMessages: MessageItem[] = [
        { id: 'msg-1', sender: 'Super Admin', recipient: 'All', title: 'Welcome to Vexaro Courier Solutions!', body: 'We are thrilled to launch the new Vexaro Logistics platform. Start booking shipments, tracking deliveries, and managing wallets seamlessly. For support, please raise a ticket under the Support section.', timestamp: '2 days ago', readBy: ['Distributor', 'Merchant'] },
        { id: 'msg-2', sender: 'Super Admin', recipient: 'All Distributors', title: 'Margin Configuration Alert', body: 'Please review and update your merchant margin configurations in the Rate Margin tab. Several courier networks have updated their base charges for the upcoming month.', timestamp: '1 day ago', readBy: [] },
        { id: 'msg-3', sender: 'Super Admin', recipient: 'All', title: 'System Scheduled Maintenance', body: 'The Vexaro portal will undergo routine database maintenance on Sunday, July 5th, from 02:00 AM to 04:00 AM IST. Some services may be temporarily offline.', timestamp: '5 hours ago', readBy: [] }
      ];
      this.allMessages = defaultMessages;
      this.saveMessages();
    }
  }

  saveNotifications() {
    localStorage.setItem('vexaro_notifications', JSON.stringify(this.allNotifications));
  }

  saveMessages() {
    localStorage.setItem('vexaro_messages', JSON.stringify(this.allMessages));
  }

  // Get notifications for current user role
  get filteredNotifications(): NotificationItem[] {
    return this.allNotifications.filter(n => n.role === this.role);
  }

  // Get unread notifications count for badge
  get unreadNotificationsCount(): number {
    return this.filteredNotifications.filter(n => !n.read).length;
  }

  // Get announcements visible to the current role
  get visibleAnnouncements(): MessageItem[] {
    if (this.role === 'Super Admin') {
      // Super Admin sees everything they sent (history)
      return this.allMessages;
    }
    if (this.role === 'Distributor') {
      return this.allMessages.filter(m => m.recipient === 'All' || m.recipient === 'All Distributors');
    }
    // Merchant
    return this.allMessages.filter(m => m.recipient === 'All' || m.recipient === 'Merchant:Sahil Gour');
  }

  // Get unread announcements count for badge
  get unreadMessagesCount(): number {
    if (this.role === 'Super Admin') {
      return 0; // Super Admin only sends
    }
    return this.visibleAnnouncements.filter(m => !m.readBy.includes(this.role)).length;
  }

  // Toggle handlers
  toggleMessages(event: Event) {
    event.stopPropagation();
    this.isMessagesOpen = !this.isMessagesOpen;
    this.isNotificationsOpen = false;
    this.isProfileOpen = false;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isMessagesOpen = false;
    this.isProfileOpen = false;
  }

  toggleProfile(event: Event) {
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
    this.isMessagesOpen = false;
    this.isNotificationsOpen = false;
  }

  // Notification Operations
  markNotificationRead(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const notif = this.allNotifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveNotifications();
    }
  }

  markAllNotificationsRead() {
    this.allNotifications.forEach(n => {
      if (n.role === this.role) {
        n.read = true;
      }
    });
    this.saveNotifications();
  }

  viewAllNotifications() {
    this.isNotificationsOpen = false;
    this.isAllNotificationsModalOpen = true;
  }

  closeAllNotificationsModal() {
    this.isAllNotificationsModalOpen = false;
  }

  // Announcement Operations
  markMessageRead(id: string) {
    if (this.role === 'Super Admin') return;
    const msg = this.allMessages.find(m => m.id === id);
    if (msg) {
      if (!msg.readBy.includes(this.role)) {
        msg.readBy.push(this.role);
        this.saveMessages();
      }
      msg.expanded = !msg.expanded;
    }
  }

  toggleMessageExpand(msg: MessageItem) {
    msg.expanded = !msg.expanded;
    if (this.role !== 'Super Admin' && !msg.readBy.includes(this.role)) {
      msg.readBy.push(this.role);
      this.saveMessages();
    }
  }

  sendAnnouncement() {
    if (!this.announcementTitle.trim() || !this.announcementBody.trim()) {
      alert('Please enter both title and body for the announcement.');
      return;
    }

    const newMsg: MessageItem = {
      id: 'msg-' + Date.now(),
      sender: 'Super Admin',
      recipient: this.announcementTarget,
      title: this.announcementTitle,
      body: this.announcementBody,
      timestamp: 'Just now',
      readBy: []
    };

    this.allMessages.unshift(newMsg);
    this.saveMessages();

    // Add alert notification for target roles
    const timestampStr = 'Just now';
    if (this.announcementTarget === 'All' || this.announcementTarget === 'All Distributors') {
      this.allNotifications.unshift({
        id: 'notif-sa-dist-' + Date.now(),
        role: 'Distributor',
        message: `New announcement: "${this.announcementTitle}"`,
        icon: 'notifications_active',
        timeAgo: timestampStr,
        read: false
      });
    }
    if (this.announcementTarget === 'All' || this.announcementTarget === 'Merchant:Sahil Gour') {
      this.allNotifications.unshift({
        id: 'notif-sa-merch-' + Date.now(),
        role: 'Merchant',
        message: `New announcement: "${this.announcementTitle}"`,
        icon: 'notifications_active',
        timeAgo: timestampStr,
        read: false
      });
    }
    this.saveNotifications();

    this.announcementTitle = '';
    this.announcementBody = '';
    this.activeMessagesTab = 'history';
    alert('Announcement successfully sent!');
  }

  // Profile operations
  navigateTo(path: string) {
    this.isProfileOpen = false;
    this.router.navigate([path]);
  }

  openChangePasswordModal() {
    this.isProfileOpen = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isPasswordModalOpen = true;
  }

  closeChangePasswordModal() {
    this.isPasswordModalOpen = false;
  }

  submitPasswordChange() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      alert('Please fill out all fields.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    if (this.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    // Success simulation
    alert('Password updated successfully!');
    this.closeChangePasswordModal();
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectTo');
    this.router.navigate(['/login']);
  }

  // Profile Picture Methods
  openAvatarModal() {
    this.isProfileOpen = false;
    this.selectedAvatar = this.profileImage;
    this.uploadedFileName = '';
    this.uploadedBase64 = '';
    this.isAvatarModalOpen = true;
  }

  closeAvatarModal() {
    this.isAvatarModalOpen = false;
  }

  selectPresetAvatar(url: string) {
    this.selectedAvatar = url;
    this.uploadedFileName = '';
    this.uploadedBase64 = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.uploadedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedBase64 = e.target.result;
        this.selectedAvatar = this.uploadedBase64;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfileImage() {
    const finalUrl = this.selectedAvatar;

    if (!finalUrl) {
      alert('Please select an avatar or upload an image file.');
      return;
    }

    try {
      this.profileImage = finalUrl;
      localStorage.setItem('vexaro_avatar_' + this.role, finalUrl);
      this.closeAvatarModal();
      alert('Profile picture updated successfully!');
    } catch (e) {
      alert('The selected image is too large. Please select a smaller image (under 2MB).');
    }
  }
}