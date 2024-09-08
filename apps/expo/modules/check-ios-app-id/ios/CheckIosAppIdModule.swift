import ExpoModulesCore

public class CheckIosAppIdModule: Module {
    public func definition() -> ModuleDefinition {
        Name("CheckIosAppId")

        Function("isIncorrectAppId") { () -> Bool in
            #if targetEnvironment(simulator)
            	return false
            #else
				guard let appId = self.extractAppId() else {
					return false
				}

            	 return appId.hasSuffix(".*") || (Bundle.main.bundleIdentifier != nil && !appId.contains(Bundle.main.bundleIdentifier!)) 
            #endif
        }

        // Function to get the App ID from the provisioning profile
        Function("getAppId") { () -> String? in
            #if targetEnvironment(simulator)
            	return nil
            #else
            	return self.extractAppId()
            #endif
        }
    }

    // Helper function to extract the application-identifier value from the provisioning profile
    private func extractAppId() -> String? {
        guard let filePath = Bundle.main.path(forResource: "embedded", ofType: "mobileprovision") else {
            return nil
        }

        let fileURL = URL(fileURLWithPath: filePath)
        do {
            let data = try String(contentsOf: fileURL, encoding: .ascii)
            let cleared = data.components(separatedBy: .whitespacesAndNewlines).joined()

            // Search for the application-identifier key and extract its value
            if let range = cleared.range(of: "<key>application-identifier</key><string>") {
                let substring = cleared[range.upperBound...]
                if let endRange = substring.range(of: "</string>") {
                    let appId = String(substring[..<endRange.lowerBound])
                    return appId
                }
            }
        } catch {
            print("Error reading provisioning profile: \(error)")
            return nil
        }
        return nil
    }
}