import { createSelector } from '@reduxjs/toolkit';
import * as types from '../actions/types';

const initialState = {
  // Certificate data
  earnedCertificates: [],
  upcomingCertificates: [],
  certificateStatuses: {},
  
  // Statistics
  stats: {
    certificatesEarned: 0,
    inProgress: 0,
    totalSkills: 0,
    averageScore: 0
  },
  
  // Loading states
  loading: {
    fetching: false,
    downloading: {}, // { courseId: boolean }
    checkingStatus: false,
    sharing: false
  },
  
  // Error states
  error: {
    fetch: null,
    download: null,
    status: null,
    share: null
  },
  
  // UI state
  lastFetched: null,
  currentStudentId: null,
  downloadHistory: [], // Array of download records
  shareHistory: [] // Array of share records
};

const certificateReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch certificates
    case types.FETCH_CERTIFICATES_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          fetching: true
        },
        error: {
          ...state.error,
          fetch: null
        }
      };

    case types.FETCH_CERTIFICATES_SUCCESS:
      // Calculate stats automatically when certificates are fetched
      const earnedCerts = action.payload.earnedCertificates || [];
      const upcomingCerts = action.payload.upcomingCertificates || [];
      
      const calculatedStats = {
        certificatesEarned: earnedCerts.length,
        inProgress: upcomingCerts.length,
        totalSkills: earnedCerts.reduce((acc, cert) => {
          return acc + (cert.skills ? cert.skills.length : 0);
        }, 0),
        averageScore: earnedCerts.length > 0 
          ? Math.round(earnedCerts.reduce((acc, cert) => acc + (cert.completionScore || 0), 0) / earnedCerts.length)
          : 0
      };

      return {
        ...state,
        earnedCertificates: earnedCerts,
        upcomingCertificates: upcomingCerts,
        stats: calculatedStats,
        currentStudentId: action.payload.studentId,
        lastFetched: new Date().toISOString(),
        loading: {
          ...state.loading,
          fetching: false
        },
        error: {
          ...state.error,
          fetch: null
        }
      };

    case types.FETCH_CERTIFICATES_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          fetching: false
        },
        error: {
          ...state.error,
          fetch: action.payload
        }
      };

    // Check certificate status
    case types.CHECK_CERTIFICATE_STATUS_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          checkingStatus: true
        },
        error: {
          ...state.error,
          status: null
        }
      };

    case types.CHECK_CERTIFICATE_STATUS_SUCCESS:
      return {
        ...state,
        certificateStatuses: {
          ...state.certificateStatuses,
          [action.payload.courseId]: {
            ...action.payload.status,
            lastChecked: new Date().toISOString()
          }
        },
        loading: {
          ...state.loading,
          checkingStatus: false
        },
        error: {
          ...state.error,
          status: null
        }
      };

    case types.CHECK_CERTIFICATE_STATUS_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          checkingStatus: false
        },
        error: {
          ...state.error,
          status: action.payload
        }
      };

    // Download certificate
    case types.DOWNLOAD_CERTIFICATE_REQUEST:
      return {
        ...state,
        error: {
          ...state.error,
          download: null
        }
      };

    case types.DOWNLOAD_CERTIFICATE_SUCCESS:
      return {
        ...state,
        downloadHistory: [
          ...state.downloadHistory,
          {
            courseId: action.payload.courseId,
            filename: action.payload.filename,
            downloadedAt: action.payload.downloadedAt
          }
        ],
        // Update the certificate to mark it as downloaded
        earnedCertificates: state.earnedCertificates.map(cert => 
          cert.courseId === action.payload.courseId 
            ? { ...cert, lastDownloaded: action.payload.downloadedAt }
            : cert
        ),
        error: {
          ...state.error,
          download: null
        }
      };

    case types.DOWNLOAD_CERTIFICATE_FAILURE:
      return {
        ...state,
        error: {
          ...state.error,
          download: {
            courseId: action.payload.courseId,
            message: action.payload.error
          }
        }
      };

    // Share certificate
    case types.SHARE_CERTIFICATE_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          sharing: true
        },
        error: {
          ...state.error,
          share: null
        }
      };

    case types.SHARE_CERTIFICATE_SUCCESS:
      return {
        ...state,
        shareHistory: [
          ...state.shareHistory,
          {
            certificateId: action.payload.certificateId,
            method: action.payload.method,
            sharedAt: action.payload.sharedAt
          }
        ],
        loading: {
          ...state.loading,
          sharing: false
        },
        error: {
          ...state.error,
          share: null
        }
      };

    case types.SHARE_CERTIFICATE_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          sharing: false
        },
        error: {
          ...state.error,
          share: action.payload
        }
      };

    // Download loading states
    case types.SET_DOWNLOAD_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          downloading: {
            ...state.loading.downloading,
            [action.payload.courseId]: action.payload.loading
          }
        }
      };

    case types.CLEAR_DOWNLOAD_LOADING:
      if (action.payload.courseId) {
        // Clear specific course loading
        const newDownloading = { ...state.loading.downloading };
        delete newDownloading[action.payload.courseId];
        return {
          ...state,
          loading: {
            ...state.loading,
            downloading: newDownloading
          }
        };
      } else {
        // Clear all download loading
        return {
          ...state,
          loading: {
            ...state.loading,
            downloading: {}
          }
        };
      }

    // Update certificate statistics
    case types.UPDATE_CERTIFICATE_STATS:
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload
        }
      };

    // Reset error
    case types.RESET_CERTIFICATE_ERROR:
      return {
        ...state,
        error: {
          fetch: null,
          download: null,
          status: null,
          share: null
        }
      };

    default:
      return state;
  }
};



// Base selectors - select raw state slices
const selectCertificateState = (state) => state.certificates;
const selectEarnedCertificates = (state) => state.certificates.earnedCertificates;
const selectUpcomingCertificates = (state) => state.certificates.upcomingCertificates;

// Memoized selectors using createSelector
export const selectCertificates = createSelector(
  [selectEarnedCertificates, selectUpcomingCertificates],
  (earned, upcoming) => ({
    earned: earned || [],
    upcoming: upcoming || []
  })
);

export const selectCertificateStats = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.stats
);

export const selectCertificateLoading = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.loading
);

export const selectCertificateErrors = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.error
);

export const selectDownloadLoading = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.loading.downloading
);

export const selectIsFetching = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.loading.fetching
);

export const selectLastFetched = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.lastFetched
);

// Additional memoized selectors
export const selectCertificateStatus = createSelector(
  [selectCertificateState, (state, courseId) => courseId],
  (certificateState, courseId) => certificateState.certificateStatuses[courseId] || null
);

export const selectDownloadHistory = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.downloadHistory
);

export const selectShareHistory = createSelector(
  [selectCertificateState],
  (certificateState) => certificateState.shareHistory
);

// Specific certificate selectors
export const selectCertificateById = createSelector(
  [selectCertificates, (state, certificateId) => certificateId],
  (certificates, certificateId) => {
    const allCertificates = [...certificates.earned, ...certificates.upcoming];
    return allCertificates.find(cert => 
      cert.credentialId === certificateId || cert.courseId === certificateId
    );
  }
);

export const selectEarnedCertificatesCount = createSelector(
  [selectEarnedCertificates],
  (earnedCertificates) => earnedCertificates.length
);

export const selectUpcomingCertificatesCount = createSelector(
  [selectUpcomingCertificates],
  (upcomingCertificates) => upcomingCertificates.length
);

// Download loading for specific course
export const selectCourseDownloadLoading = createSelector(
  [selectDownloadLoading, (state, courseId) => courseId],
  (downloadLoading, courseId) => downloadLoading[courseId] || false
);

// Check if any downloads are in progress
export const selectHasActiveDownloads = createSelector(
  [selectDownloadLoading],
  (downloadLoading) => Object.values(downloadLoading).some(Boolean)
);

// Get certificates by status
export const selectCertificatesByStatus = createSelector(
  [selectCertificates],
  (certificates) => ({
    earned: certificates.earned,
    inProgress: certificates.upcoming,
    total: certificates.earned.length + certificates.upcoming.length
  })
);

// Calculate completion percentage for upcoming certificates
export const selectOverallProgress = createSelector(
  [selectUpcomingCertificates],
  (upcomingCertificates) => {
    if (upcomingCertificates.length === 0) return 100;
    
    const totalProgress = upcomingCertificates.reduce(
      (acc, cert) => acc + (cert.progress || 0), 0
    );
    return Math.round(totalProgress / upcomingCertificates.length);
  }
);

export default certificateReducer;