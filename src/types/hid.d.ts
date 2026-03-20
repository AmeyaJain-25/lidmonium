// WebHID API types
interface HIDDeviceFilter {
  vendorId?: number;
  productId?: number;
  usagePage?: number;
  usage?: number;
}

interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[];
}

interface HIDInputReportEvent extends Event {
  device: HIDDevice;
  reportId: number;
  data: DataView;
}

interface HIDDevice extends EventTarget {
  opened: boolean;
  vendorId: number;
  productId: number;
  productName: string;
  open(): Promise<void>;
  close(): Promise<void>;
  addEventListener(
    type: 'inputreport',
    listener: (ev: HIDInputReportEvent) => void
  ): void;
  removeEventListener(
    type: 'inputreport',
    listener: (ev: HIDInputReportEvent) => void
  ): void;
}

interface HIDConnectionEvent extends Event {
  device: HIDDevice;
}

interface HID extends EventTarget {
  getDevices(): Promise<HIDDevice[]>;
  requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice[]>;
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (ev: HIDConnectionEvent) => void
  ): void;
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (ev: HIDConnectionEvent) => void
  ): void;
}

interface Navigator {
  hid?: HID;
}
