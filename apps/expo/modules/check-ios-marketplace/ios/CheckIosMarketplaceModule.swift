import ExpoModulesCore

#if canImport(MarketplaceKit)
import MarketplaceKit
#endif

public class CheckIosMarketplaceModule: Module {
    public func definition() -> ModuleDefinition {
        Name("CheckIosMarketplace")

        AsyncFunction("getCurrentMarketplaceAsync") { () -> Any in
            #if canImport(MarketplaceKit)
            if #available(iOS 17.4, *) {
                do {
                    let currentDistributor = try await AppDistributor.current
                    switch currentDistributor {
                    case .appStore:
                        return "App Store"
                    case .testFlight:
                        return "TestFlight"
                    case .marketplace:
                        return "Alternative marketplace"
                    case .other:
                        return "Other"
                    @unknown default:
                        return "Unknown"
                    }
                } catch {
                    return "Error"
                }
            } else {
                return "Unavailable"
            }
            #else
            return "Unavailable"
            #endif
        }
    }
}
