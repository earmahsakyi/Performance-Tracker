import axios from "axios";
import * as types from "./types";
import { toast } from "react-hot-toast";


const setAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Try both possible header formats
    axios.defaults.headers.common['x-auth-token'] = token;
   
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Helper function to get current student ID
const getCurrentStudentId = () =>
  localStorage.getItem("studentId") || localStorage.getItem("userId");

// ✅ Fetch all certificates
export const fetchCertificates = (studentId = null) => {
  return async (dispatch) => {
    dispatch({ type: types.FETCH_CERTIFICATES_REQUEST });
    setAuthToken(); // attach token before request

    try {
      const id = studentId || getCurrentStudentId();
      if (!id) throw new Error("Student ID not found. Please log in again.");

      const { data } = await axios.get(`/api/student/${id}/certificates`);

      dispatch({
        type: types.FETCH_CERTIFICATES_SUCCESS,
        payload: {
          earnedCertificates: data.earnedCertificates || [],
          upcomingCertificates: data.upcomingCertificates || [],
          studentId: id,
        },
      });

      dispatch(
        updateCertificateStats(
          data.earnedCertificates || [],
          data.upcomingCertificates || []
        )
      );
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch certificates";
      dispatch({ type: types.FETCH_CERTIFICATES_FAILURE, payload: message });
      toast.error(message);
    }
  };
};

// ✅ Check certificate status
export const checkCertificateStatus = (studentId, courseId) => {
  return async (dispatch) => {
    dispatch({ type: types.CHECK_CERTIFICATE_STATUS_REQUEST });
    setAuthToken();

    try {
      const { data } = await axios.get(
        `/api/certificates/${studentId}/${courseId}/status`
      );

      dispatch({
        type: types.CHECK_CERTIFICATE_STATUS_SUCCESS,
        payload: { courseId, status: data },
      });

      return data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to check certificate status";
      dispatch({
        type: types.CHECK_CERTIFICATE_STATUS_FAILURE,
        payload: message,
      });
      throw error;
    }
  };
};

// ✅ Download certificate
export const downloadCertificate = (courseId, courseName, studentId = null) => {
  return async (dispatch) => {
    const id = studentId || getCurrentStudentId();

    dispatch({ type: types.DOWNLOAD_CERTIFICATE_REQUEST, payload: { courseId } });
    dispatch({
      type: types.SET_DOWNLOAD_LOADING,
      payload: { courseId, loading: true },
    });
    setAuthToken();

    try {
      if (!id) throw new Error("Student ID not found. Please log in again.");

      const response = await axios.get(
        `/api/certificates/${id}/${courseId}/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      let filename = `certificate-${courseName.replace(/\s+/g, "-")}.png`;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch({
        type: types.DOWNLOAD_CERTIFICATE_SUCCESS,
        payload: { courseId, filename, downloadedAt: new Date().toISOString() },
      });

      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to download certificate";

      dispatch({
        type: types.DOWNLOAD_CERTIFICATE_FAILURE,
        payload: { courseId, error: message },
      });
      toast.error(message);
    } finally {
      dispatch({ type: types.CLEAR_DOWNLOAD_LOADING, payload: { courseId } });
    }
  };
};

// ✅ Share certificate (unchanged)
export const shareCertificate = (certificate) => {
  return async (dispatch) => {
    dispatch({ type: types.SHARE_CERTIFICATE_REQUEST });

    try {
      const shareData = {
        title: certificate.title,
        text: `I've earned a certificate in ${certificate.course}! 🎉`,
        url: `${window.location.origin}/certificates/${certificate.credentialId}`,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);

        dispatch({
          type: types.SHARE_CERTIFICATE_SUCCESS,
          payload: {
            certificateId: certificate.credentialId,
            method: "native",
            sharedAt: new Date().toISOString(),
          },
        });

        toast.success("Certificate shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        dispatch({
          type: types.SHARE_CERTIFICATE_SUCCESS,
          payload: {
            certificateId: certificate.credentialId,
            method: "clipboard",
            sharedAt: new Date().toISOString(),
          },
        });
        toast.success("Certificate link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share certificate error:", error);
      dispatch({
        type: types.SHARE_CERTIFICATE_FAILURE,
        payload: error.message,
      });

      try {
        const fallbackUrl = `${window.location.origin}/certificates/${certificate.credentialId}`;
        await navigator.clipboard.writeText(fallbackUrl);
        toast.success("Certificate link copied to clipboard!");
      } catch {
        toast.error("Failed to share certificate");
      }
    }
  };
};

// ✅ Update stats
export const updateCertificateStats = (earnedCertificates, upcomingCertificates) => {
  return (dispatch) => {
    const totalSkills = earnedCertificates.reduce(
      (acc, cert) => acc + (cert.skills ? cert.skills.length : 0),
      0
    );

    const avgScore =
      earnedCertificates.length > 0
        ? Math.round(
            earnedCertificates.reduce(
              (acc, cert) => acc + (cert.completionScore || 0),
              0
            ) / earnedCertificates.length
          )
        : 0;

    dispatch({
      type: types.UPDATE_CERTIFICATE_STATS,
      payload: {
        certificatesEarned: earnedCertificates.length,
        inProgress: upcomingCertificates.length,
        totalSkills,
        averageScore: avgScore,
      },
    });
  };
};

// ✅ Reset helpers
export const resetCertificateError = () => ({ type: types.RESET_CERTIFICATE_ERROR });
export const setDownloadLoading = (courseId, loading) => ({
  type: types.SET_DOWNLOAD_LOADING,
  payload: { courseId, loading },
});
export const clearAllDownloadLoading = () => ({
  type: types.CLEAR_DOWNLOAD_LOADING,
  payload: {},
});
