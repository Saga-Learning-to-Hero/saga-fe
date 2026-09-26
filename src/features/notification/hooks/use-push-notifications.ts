"use client";
import { toast } from "sonner";
import { showSuccessToast, showErrorToast } from "@/lib/api-error";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { getPushInstallationStorageKey } from "@/features/auth/lib/logout-orchestrator";
import { NotificationService } from "../api/notification-service";
import {
  isFirebaseMessagingSupported,
  getInstallationId,
  getFcmRegistrationToken,
} from "@/lib/firebase/firebase-client";

export function usePushNotifications() {
  const { user, isAuthenticated } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const hasAutoRegisteredRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    void isFirebaseMessagingSupported().then((supported) => {
      setIsSupported(supported);
    });
  }, []);

  const registerPush = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    const storageKey = getPushInstallationStorageKey(user.id);
    setIsRegistering(true);

    try {
      let swRegistration: ServiceWorkerRegistration | undefined;
      if ("serviceWorker" in navigator) {
        swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;
      }

      const [fid, token] = await Promise.all([
        getInstallationId(),
        getFcmRegistrationToken(swRegistration),
      ]);

      if (!fid || !token) {
        return false;
      }

      const response = await NotificationService.registerPushInstallation({
        firebaseInstallationId: fid,
        fcmToken: token,
        platform: "WEB",
      });

      if (response?.id) {
        localStorage.setItem(storageKey, response.id);
        setIsRegistered(true);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      permission === "granted" &&
      isSupported &&
      !hasAutoRegisteredRef.current
    ) {
      hasAutoRegisteredRef.current = true;
      void registerPush();
    }
  }, [isAuthenticated, user, permission, isSupported, registerPush]);

  const requestPermissionAndRegister = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showErrorToast("Trình duyệt không hỗ trợ thông báo đẩy.");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const success = await registerPush();
        if (success) {
          showSuccessToast("Đã bật thông báo trình duyệt thành công!");
          return true;
        } else {
          showErrorToast("Không thể đăng ký thiết bị thông báo với máy chủ.");
          return false;
        }
      } else if (result === "denied") {
        toast.warning(
          "Bạn đã chặn quyền thông báo. Vui lòng vào Cài đặt trình duyệt để cho phép nhận thông báo từ SAGA."
        );
        return false;
      }
      return false;
    } catch {
      showErrorToast("Đã xảy ra lỗi khi yêu cầu quyền thông báo.");
      return false;
    }
  }, [registerPush]);

  return {
    permission,
    isSupported,
    isRegistering,
    isRegistered,
    requestPermissionAndRegister,
  };
}
