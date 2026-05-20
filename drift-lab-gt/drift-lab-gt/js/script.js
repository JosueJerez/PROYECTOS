document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements ---
    const mainContent = document.getElementById('main-content');
    const aboutSection = document.getElementById('about-section'); // Added
    const gallerySection = document.getElementById('gallery-section');
    const configuratorSection = document.getElementById('configurator-section');
    const contactSection = document.getElementById('contact-section');
    const allSections = [aboutSection, gallerySection, configuratorSection, contactSection]; // Updated array

    const carViewer = document.getElementById('main-car-viewer');
    const carImage = document.getElementById('active-car-image');
    const carNameTitle = document.getElementById('current-car-name');
    const optionsPanelContainer = configuratorSection.querySelector('.options-panel-container');
    const allOptionsPanels = optionsPanelContainer.querySelectorAll('.options-panel');

    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const galleryGrid = gallerySection.querySelector('.product-grid');
    const backToGalleryButton = configuratorSection.querySelector('.back-to-gallery-btn');

    // --- State Variables ---
    let currentCar = ''; // No default car selected initially
    let currentBasePath = '';
    let currentFrame = 0;
    const frameCount = 15; // Assuming 15 frames (00 to 14)
    const dragThreshold = 5; // Pixels to move before changing frame

    // --- Rotation Variables ---
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    // --- Function to Switch Active Page Section ---
    function switchSection(targetId) {
        console.log("Switching to section:", targetId); // Debug log
        allSections.forEach(section => {
            if (section) { // Check if section exists
                 section.classList.toggle('active', section.id === targetId);
            } else {
                console.warn("Attempted to toggle class on null section");
            }
        });
        // Update nav link active state
        navLinks.forEach(link => {
             if (link) { // Check if link exists
                link.classList.toggle('active', link.dataset.target === targetId);
             }
        });
        // Scroll to top when switching sections
        window.scrollTo(0, 0);

        // Special handling for Configurator's flex display
         if (configuratorSection) {
            configuratorSection.style.display = (targetId === 'configurator-section') ? 'flex' : 'none';
        }
    }


    // --- Function to Update Configurator View ---
    function updateConfiguratorView(carData) {
        if (!carData || !carData.car) {
            console.error("Invalid car data for configurator.");
            return;
        }
        console.log("Updating configurator for:", carData);

        currentCar = carData.car;
        currentBasePath = carData.basePath; // Ensure this path exists and is correct
        currentFrame = 1; // Reset frame (often frame 01 is the start)

        // Update Title
        if (carNameTitle) carNameTitle.textContent = carData.name;

        // Update Image Source & Alt Text
        const initialImageSrc = `${currentBasePath}${String(currentFrame).padStart(2, '0')}.png`;
        if (carImage) {
            carImage.src = initialImageSrc;
            carImage.alt = `${carData.name} - Drag to Rotate`;
             // Attempt to reset filters - assuming 'silver' is default or first swatch
             carImage.dataset.colorFilter = 'silver'; // Default to silver (or match first default swatch)
        } else {
             console.error("Car image element not found");
             return; // Stop if image element is missing
        }


        // Update Options Panels Visibility and Reset Controls
        let foundPanel = false;
        allOptionsPanels.forEach(panel => {
            const panelCar = panel.dataset.carPanel;
            const isActive = panelCar === currentCar;
            panel.classList.toggle('active', isActive);
            if (isActive) {
                resetControls(panel); // Reset controls for the active panel
                foundPanel = true;
            }
        });
        if (!foundPanel) {
             console.warn(`No options panel found for car: ${currentCar}`);
        }


        // Preload first few images
        preloadImages(currentBasePath, frameCount);

        // Switch to the configurator section view
        switchSection('configurator-section');
    }

     // --- Function to Reset Controls in a Panel ---
    function resetControls(panel) {
        // Reset color swatches to default (find the first one or one marked default, e.g., silver)
        const colorSwatches = panel.querySelectorAll('.color-swatch');
        let defaultSwatchSet = false;
        colorSwatches.forEach(swatch => {
            const isDefault = swatch.dataset.color === 'silver'; // Assuming silver is default
            swatch.classList.toggle('active', isDefault);
            if (isDefault) defaultSwatchSet = true;
        });
         // If no 'silver' swatch, activate the first one as default
         if (!defaultSwatchSet && colorSwatches.length > 0) {
             colorSwatches[0].classList.add('active');
             if(carImage) carImage.dataset.colorFilter = colorSwatches[0].dataset.color; // Update image filter
         } else if (defaultSwatchSet && carImage) {
             carImage.dataset.colorFilter = 'silver'; // Ensure image filter matches
         }

        // Reset dropdowns
        panel.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
        // Uncheck checkboxes
        panel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    }


    // --- Image Preloading ---
     function preloadImages(basePath, count) {
        if (!basePath) {
            console.warn("Cannot preload images: basePath is missing.");
            return;
        }
        console.log(`Preloading images for ${basePath}`);
        for (let i = 1; i <= Math.min(5, count); i++) { // Preload 1 through 5 (or count)
            const img = new Image();
            img.src = `${basePath}${String(i).padStart(2, '0')}.png`;
            // Optional: Add error handling for image loading if needed
            img.onerror = () => console.warn(`Failed to preload ${img.src}`);
            img.onload = () => console.log(`Preloaded ${img.src}`); // Log successful preloads
        }
    }

    // --- Rotation Logic ---
    function updateRotationFrame(newFrame) {
        if (!currentBasePath) return; // Ensure basePath is set

        // Wrap frame number correctly (assuming frames 01 to frameCount)
        currentFrame = newFrame;
        if (currentFrame < 1) {
            currentFrame = frameCount;
        } else if (currentFrame > frameCount) {
            currentFrame = 1;
        }

        const imageName = `${currentBasePath}${String(currentFrame).padStart(2, '0')}.png`;
         if (carImage) {
            carImage.src = imageName;
        }
    }
    // Add mouse/touch listeners for rotation
    if (carViewer) { // Ensure carViewer exists
        carViewer.addEventListener('mousedown', (e) => {
            isDragging = true; startX = e.pageX; currentX = startX;
            carViewer.style.cursor = 'grabbing'; e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !carImage) return; // Ensure image exists too
            const deltaX = e.pageX - currentX;
            // Adjust sensitivity - change frame for every `dragThreshold` pixels moved
            const frameChange = Math.round(deltaX / dragThreshold); // Use round for more intuitive feel
            if (frameChange !== 0) { // Check if there *is* a change
                 // Invert direction: dragging right rotates car right (shows lower frame numbers usually)
                updateRotationFrame(currentFrame - frameChange);
                currentX = e.pageX; // Update position only when frame changes
            }
            e.preventDefault();
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) { isDragging = false; if(carViewer) carViewer.style.cursor = 'grab';}
        });
        // Add mouseleave on the *document* to catch cases where mouse up happens outside viewer
         document.addEventListener('mouseleave', () => {
             if (isDragging) { isDragging = false; if(carViewer) carViewer.style.cursor = 'grab';}
         });

        carViewer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true; startX = e.touches[0].pageX; currentX = startX;
                carViewer.style.cursor = 'grabbing';
                // No preventDefault needed if passive: true, but needed for touchmove
            }
        }, { passive: true }); // Passive for potential scroll optimization

        carViewer.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1 || !carImage) return;
            const deltaX = e.touches[0].pageX - currentX;
            const frameChange = Math.round(deltaX / dragThreshold);
            if (frameChange !== 0) {
                updateRotationFrame(currentFrame - frameChange); // Invert direction
                currentX = e.touches[0].pageX;
                 // Prevent default scroll/zoom behaviour ONLY when actively dragging image
                e.preventDefault();
            }
        }, { passive: false }); // NOT passive because we call preventDefault

        carViewer.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                if(carViewer) carViewer.style.cursor = 'grab';
            }
        });
         carViewer.addEventListener('touchcancel', () => { // Handle interrupted touches
            if (isDragging) {
                isDragging = false;
                 if(carViewer) carViewer.style.cursor = 'grab';
            }
        });
    } else {
        console.error("Car viewer element not found.");
    }


    // --- Event Listener for Navigation Links ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            if (!document.getElementById(targetId)) {
                 console.error(`Navigation target section #${targetId} not found.`);
                 return;
            }

            if (targetId === 'configurator-section' && !currentCar) {
                // If trying to go to 'Build' without selecting a car, switch to gallery and maybe alert.
                alert("Please select a car from the Shop first.");
                switchSection('gallery-section'); // Ensure gallery is shown
            } else {
                switchSection(targetId);
            }
        });
    });

    // --- Event Listener for Gallery Card Buttons (Event Delegation) ---
     if (galleryGrid) {
        galleryGrid.addEventListener('click', (event) => {
            const button = event.target.closest('.product-card-button[data-action="customize"]');
            if (button) {
                const card = button.closest('.product-card');
                 if (card && card.dataset.car && card.dataset.name && card.dataset.basePath) {
                    const carData = {
                        car: card.dataset.car,
                        name: card.dataset.name,
                        basePath: card.dataset.basePath // Pass the base path
                    };
                    updateConfiguratorView(carData);
                 } else {
                    console.error("Missing data attributes on product card or button parent.");
                 }
            }
        });
    } else {
         console.error("Gallery grid element not found.");
    }


    // --- Event Listener for "Back to Gallery" Button ---
     if (backToGalleryButton) {
        backToGalleryButton.addEventListener('click', () => {
            switchSection('gallery-section');
            // Optional: Reset configurator state if desired when going back
            // currentCar = '';
            // currentBasePath = '';
            // if(carImage) carImage.src = ''; // Clear image
            // if(carNameTitle) carNameTitle.textContent = '';
        });
    }

    // --- Event Listeners for Options (Color, Customization) (Delegated) ---
     if (optionsPanelContainer) {
        optionsPanelContainer.addEventListener('click', (event) => {
            // Handle Color Swatch Clicks
            if (event.target.classList.contains('color-swatch')) {
                const swatch = event.target;
                const selectedColor = swatch.dataset.color;
                const parentPanel = swatch.closest('.options-panel');

                if (!parentPanel || !parentPanel.classList.contains('active')) return; // Only act on active panel

                // Update swatch visual state
                parentPanel.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');

                // Update car image filter
                if (carImage) {
                    carImage.dataset.colorFilter = selectedColor;
                     console.log(`Color changed to: ${selectedColor}`);
                }
            }
        });

        optionsPanelContainer.addEventListener('change', (event) => {
             // Handle Select Dropdowns and Checkboxes
            if (event.target.matches('select') || event.target.matches('input[type="checkbox"]')) {
                const control = event.target;
                const parentPanel = control.closest('.options-panel');

                if (!parentPanel || !parentPanel.classList.contains('active')) return; // Only act on active panel

                const optionName = control.name;
                const optionValue = control.type === 'checkbox' ? control.checked : control.value;
                console.log(`Car: ${currentCar}, Customization changed: ${optionName} = ${optionValue}`);
                 // Add logic here to potentially update the car image or price based on selection
            }
        });
    } else {
         console.error("Options panel container not found.");
    }


    // --- Initial Setup ---
    // Start on the 'About' page by default
    switchSection('about-section');


}); // End DOMContentLoaded