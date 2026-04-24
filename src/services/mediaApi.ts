import { apiClient } from "./apiClient";

export interface CloudinarySignature {
  signature: string;
  timestamp: string | number;
  cloud_name: string;
  api_key: string;
  folder?: string;
  tags?: string;
}

export const mediaApi = {
  getSignature: async (): Promise<CloudinarySignature> => {
    const response: any = await apiClient.get("/media/signature");
    if (response.success && response.data) {
      console.log('Nhan signature thanh cong')
      return response.data;
    }
    throw new Error("Không thể lấy signature từ server");
  },

  uploadToCloudinary: async (
    fileUri: string,
    signatureData: CloudinarySignature,
    resourceType: "image" | "video" | "raw" | "auto" = "auto",
    mimeType?: string
  ): Promise<any> => {
    const formData = new FormData();

    const filename = fileUri.split("/").pop() || `upload_${Date.now()}`;
    const type = mimeType || (resourceType === "video" ? "video/mp4" : resourceType === "image" ? "image/jpeg" : "application/octet-stream");

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: type,
    } as any);

    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("api_key", signatureData.api_key);

    if (signatureData.folder) {
      formData.append("folder", signatureData.folder);
    }
    if (signatureData.tags) {
      formData.append("tags", signatureData.tags);
    }

    console.log('Bat dau upload len cloudinary', signatureData);
    console.log(formData);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/${resourceType}/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload error:", errorText);
      throw new Error(`Upload thất bại: ${response.status}`);
    }

    console.log('Upload len cloudinary thanh cong');
    return await response.json();
  },

  createMediaRecord: async (cloudinaryResponse: any): Promise<any> => {
    const dto = {
      public_id: cloudinaryResponse.public_id,
      secure_url: cloudinaryResponse.secure_url,
      resource_type: cloudinaryResponse.resource_type,
      format: cloudinaryResponse.format,
      width: cloudinaryResponse.width,
      height: cloudinaryResponse.height,
      bytes: cloudinaryResponse.bytes,
      duration: cloudinaryResponse.duration,
      is_audio: cloudinaryResponse.resource_type === "video" && !cloudinaryResponse.width,
    };

    const response: any = await apiClient.post("/media", dto);
    if (response.success && response.data) {
      return response.data;
    }

    if (response.id) return response;

    throw new Error("Không thể lưu thông tin media vào hệ thống máy chủ");
  },
};
