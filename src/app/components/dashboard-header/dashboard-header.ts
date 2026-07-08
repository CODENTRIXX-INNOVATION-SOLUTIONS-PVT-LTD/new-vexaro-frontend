import { Component, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.css'
})
export class DashboardHeader implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private financeService = inject(FinanceService);
  private router = inject(Router);

  @Input() role = '';
  @Input() userName = '';
  @Input() email = '';
  @Input() profileImage = 'https://i.pravatar.cc/150?img=12';

  // Maps backend role enums to display strings
  private readonly roleDisplayMap: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    DISTRIBUTOR: 'Distributor',
    MERCHANT: 'Merchant',
  };

  // Toggle Panel States
  isQueryPanelOpen = false;
  isNotificationsOpen = false;
  isProfileOpen = false;
  isSettingsOpen = false;

  // Wallet balance
  walletBalance = signal<number>(0);
  isLoadingWallet = signal<boolean>(false);

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
    'https://i.pravatar.cc/150?img=12', // default Super Admin
    'https://i.pravatar.cc/150?img=47', // default Merchant
    'https://i.pravatar.cc/150?img=33',
    'https://i.pravatar.cc/150?img=56',
    'https://i.pravatar.cc/150?img=60',
    'https://i.pravatar.cc/150?img=68'
  ];
  selectedAvatar = '';

  // Query Alert Form
  querySubject = '';
  queryMessage = '';
  queryOrderId = '';
  isSubmittingQuery = false;

  // Dynamic Lists
  allNotifications: any[] = [];
  unreadNotificationsCount = 0;
  private pollInterval: any;

  ngOnInit() {
    // Load cached profile data from localStorage
    const storedUser = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
        this.email = user.email ?? '';
        this.role = this.roleDisplayMap[user.role] ?? user.role ?? '';
      } catch {
        const storedRole = localStorage.getItem('userRole') ?? sessionStorage.getItem('userRole') ?? '';
        this.role = this.roleDisplayMap[storedRole] ?? storedRole;
      }
    } else {
      const storedRole = localStorage.getItem('userRole') ?? sessionStorage.getItem('userRole') ?? '';
      this.role = this.roleDisplayMap[storedRole] ?? storedRole;
    }

    // Load saved profile picture
    const savedAvatar = localStorage.getItem('vexaro_avatar_' + this.role);
    if (savedAvatar) {
      this.profileImage = savedAvatar;
    }

    // Load actual notifications from backend
    this.fetchNotifications();

    // Load wallet balance
    this.fetchWalletBalance();

    // Set up polling (every 30 seconds)
    this.pollInterval = setInterval(() => {
      this.fetchNotifications();
      this.fetchWalletBalance();
    }, 30000);

    // Refresh user profile details in the background
    this.authService.getMe().subscribe({
      next: (res) => {
        this.userName = `${res.data.firstName} ${res.data.lastName}`;
        this.email = res.data.email;
        this.role = this.roleDisplayMap[res.data.role] ?? res.data.role;
      },
      error: () => { /* fallback gracefully to localStorage values */ },
    });

    // Close dropdowns on outer click
    window.addEventListener('click', this.handleOuterClick);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    window.removeEventListener('click', this.handleOuterClick);
  }

  private handleOuterClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.profile') && !target.closest('.profile-dropdown')) {
      this.isProfileOpen = false;
    }
    if (!target.closest('.notification') && !target.closest('.notifications-dropdown') && !target.closest('.all-notifications-modal')) {
      this.isNotificationsOpen = false;
    }
    if (!target.closest('.query-trigger') && !target.closest('.slide-over-panel')) {
      this.isQueryPanelOpen = false;
    }
    if (!target.closest('.settings-dropdown') && !target.closest('.icon-btn')) {
      this.isSettingsOpen = false;
    }
  };

  // Fetch all user notifications from the API
  fetchNotifications() {
    this.notificationService.listNotifications({ limit: 50 }).subscribe({
      next: (res) => {
        this.allNotifications = res.data.notifications || [];
        this.unreadNotificationsCount = res.data.unreadCount ?? 0;
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
      }
    });
  }

  // Fetch wallet balance from the API
  fetchWalletBalance() {
    this.isLoadingWallet.set(true);
    this.financeService.getMyWallet().subscribe({
      next: (res) => {
        this.walletBalance.set(res.data.balance || 0);
        this.isLoadingWallet.set(false);
      },
      error: (err) => {
        console.error('Failed to load wallet balance:', err);
        this.isLoadingWallet.set(false);
      }
    });
  }

  // Toggle dropdowns
  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isQueryPanelOpen = false;
    this.isProfileOpen = false;
    this.isSettingsOpen = false;
  }

  toggleProfile(event: Event) {
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
    this.isQueryPanelOpen = false;
    this.isNotificationsOpen = false;
  }

  toggleSettings(event: Event) {
    event.stopPropagation();
    this.isSettingsOpen = !this.isSettingsOpen;
    this.isQueryPanelOpen = false;
    this.isNotificationsOpen = false;
    this.isProfileOpen = false;
  }

  toggleQueryPanel(event: Event) {
    event.stopPropagation();
    this.isQueryPanelOpen = !this.isQueryPanelOpen;
    this.isNotificationsOpen = false;
    this.isProfileOpen = false;
  }

  // Mark a single notification read
  markNotificationRead(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const notif = this.allNotifications.find(n => n._id === id);
    if (notif && !notif.isRead) {
      this.notificationService.markAsRead(id).subscribe({
        next: () => {
          notif.isRead = true;
          this.unreadNotificationsCount = Math.max(0, this.unreadNotificationsCount - 1);
          if (notif.link) {
            this.isNotificationsOpen = false;
            this.isAllNotificationsModalOpen = false;
            this.router.navigateByUrl(notif.link);
          }
        },
        error: (err) => console.error('Failed to mark read:', err)
      });
    } else if (notif && notif.link) {
      this.isNotificationsOpen = false;
      this.isAllNotificationsModalOpen = false;
      this.router.navigateByUrl(notif.link);
    }
  }

  // Mark all notifications read
  markAllNotificationsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.allNotifications.forEach(n => n.isRead = true);
        this.unreadNotificationsCount = 0;
      },
      error: (err) => console.error('Failed to mark all read:', err)
    });
  }

  // Submit Query Alert Notification
  submitQueryAlert() {
    if (!this.querySubject.trim() || !this.queryMessage.trim()) {
      alert('Please fill in both subject and message.');
      return;
    }
    this.isSubmittingQuery = true;
    const payload = {
      subject: this.querySubject.trim(),
      message: this.queryMessage.trim(),
      orderId: this.queryOrderId.trim() || undefined
    };

    this.notificationService.raiseQuery(payload).subscribe({
      next: () => {
        this.isSubmittingQuery = false;
        this.querySubject = '';
        this.queryMessage = '';
        this.queryOrderId = '';
        this.isQueryPanelOpen = false;
        alert('Query alert raised successfully!');
        this.fetchNotifications();
      },
      error: (err) => {
        this.isSubmittingQuery = false;
        alert('Failed to send query alert: ' + (err.error?.message || 'Server error'));
      }
    });
  }

  viewAllNotifications() {
    this.isNotificationsOpen = false;
    this.isAllNotificationsModalOpen = true;
  }

  closeAllNotificationsModal() {
    this.isAllNotificationsModalOpen = false;
  }

  // Icon mapping helpers
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'SHIPMENT': return 'local_shipping';
      case 'PAYMENT': return 'account_balance_wallet';
      case 'DISPUTE': return 'gavel';
      case 'SYSTEM': return 'settings';
      case 'INVITE': return 'person_add';
      case 'QUERY': return 'contact_support';
      default: return 'notifications';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'SUCCESS': return 'priority-success';
      case 'INFO': return 'priority-info';
      case 'WARNING': return 'priority-warning';
      case 'CRITICAL': return 'priority-critical';
      default: return 'priority-info';
    }
  }

  getFormattedTime(dateStr: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  navigateTo(path: string) {
    this.isProfileOpen = false;
    this.router.navigate([path]);
  }

  openSettings() {
    if (this.role === 'Super Admin') {
      this.router.navigate(['/super-admin/settings']);
    } else if (this.role === 'Distributor') {
      this.router.navigate(['/distributor/settings/profile']);
    } else if (this.role === 'Merchant') {
      this.router.navigate(['/merchant/profile']);
    }
  }

  navigateToSenderProfile(senderId: string, senderRole: string) {
    const currentRole = this.role;
    let url = '';

    if (currentRole === 'Distributor' && senderRole === 'MERCHANT') {
      url = `/distributor/merchants/${senderId}`;
    } else if (currentRole === 'Super Admin' && senderRole === 'DISTRIBUTOR') {
      url = `/super-admin/distributors/${senderId}`;
    } else if (currentRole === 'Super Admin' && senderRole === 'MERCHANT') {
      url = `/super-admin/merchants/${senderId}`;
    } else {
      return;
    }

    this.isNotificationsOpen = false;
    this.isAllNotificationsModalOpen = false;
    this.router.navigate([url]);
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