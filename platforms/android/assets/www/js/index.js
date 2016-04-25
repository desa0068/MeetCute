var app = {
    // Application Constructor
    appDatabaseName:'desa0068.2',
    modal: null,
    db: null,
    profile: {},
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady);
    },
    onDeviceReady: function () {
        //console.log("device is ready");
        StatusBar.overlaysWebView(false);
        StatusBar.styleDefault();
        app.modal = window.modal;
        document.querySelector("#menu").addEventListener("click", app.navigate);
        document.getElementById("madlibLink").addEventListener("click", app.navigate);
        document.getElementById("btnScan").addEventListener("click", app.scan);
        document.getElementById("btnEdit").addEventListener("click", app.showWizard);
		document.querySelector(".overlay").addEventListener("click",app.closePopup);
        document.addEventListener("backbutton",onBackKeyDown,false);
        function onBackKeyDown(){
            app.navigate;
            history.replaceState({"page": "profile"}, null, "#profile");
            document.querySelector("[data-href=profile]").click();
            app.modal.hide();
        }
        history.replaceState({
            "page": "profile"
        }, null, "#profile");
        document.querySelector("[data-href=profile]").click();
        window.addEventListener("popstate", app.popPop);

        window.sqlitePlugin.echoTest(function () {
            console.log("sqlite plugin supported");
        }, function () {
            console.warn("sqlite plugin NOT supported");
        });
        app.setupDB();

    },
	closePopup:function(ev){
        app.modal.hide();
	},
    navigate: function (ev) {
        ev.preventDefault();
        //the ul is the currentTarget, the target could be <li>, <a>, or <i>
        //we need to access the data-href from the anchor tag
        var ct, tagname, id, pages, tabs;
        ct = ev.target;
        tagname = ct.tagName.toLowerCase();
        console.log("tagname " + tagname);
        if (tagname == 'a') {
            id = ct.getAttribute("data-href");
        } else if (tagname == 'i') {
            id = ct.parentElement.getAttribute("data-href");
        } else {
            //li
            if (ct.hasAttribute("data-href")) {
                id = ct.getAttribute("data-href");
            } else {
                id = ct.querySelector("a").getAttribute("data-href");
            }
        }
        //add to history
        history.pushState({
            "page": id
        }, null, "#" + id);
        //switch the page view
        pages = document.querySelectorAll("[data-role=page]");
        tabs = document.querySelectorAll("#menu li");
        [].forEach.call(pages, function (item, index) {
            item.classList.remove("active-page");
            if (item.id == id) {
				
                item.classList.add("active-page");
            }
        });
        [].forEach.call(tabs, function (item, index) {
            item.classList.remove("active-tab");
            if (item.querySelector("a").getAttribute("data-href") == id) {
                item.classList.add("active-tab");
            }
        });
		if(id == "profile"){
			document.getElementById("btnEdit").classList.remove("hide");
			document.getElementById("btnEdit").classList.add("show");
            app.fetchProfile();
        }
        if (id == "contacts") {
            console.log("get contacts list ready");
			document.getElementById("btnEdit").classList.remove("show");
			document.getElementById("btnEdit").classList.add("hide");
            app.fetchContacts();	
        }
        if (id == "scan") {
            console.log("get profile ready and qr code");
			document.getElementById("btnEdit").classList.remove("show");
			document.getElementById("btnEdit").classList.add("hide");
            app.fetchProfile();
        }
        if (id == "madlib") {
            //load the madlib story for the contact
            var contact = ct.getAttribute("data-id");
            app.loadStory(contact);
        }
    },
    setupDB: function () {
        //connect to the db, create the tables, load the profile if one exists, create the QRcode from the profile 
        console.log("about to openDatabase");
        app.db = sqlitePlugin.openDatabase({
                name: app.appDatabaseName,
                iosDatabaseLocation: 'default'
            },
            function (db) {
                //set up the tables
                console.log("create the tables IF NOT EXISTS");
                db.transaction(function (tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS profile(item_id INTEGER PRIMARY KEY AUTOINCREMENT, item_name TEXT, item_value TEXT)');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS madlibs(madlib_id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT, madlib_txt TEXT)');
                }, function (err) {
                    console.log("error with the tx trying to create the tables. " + JSON.stringify(err));
                });

                //now go get the profile info for home page
            },
            function (err) {
                console.log('Open database ERROR: ' + JSON.stringify(err));
            });
    },
    saveProfile: function () {
        //called by clicking on the LAST button in the modal wizard
        //save all the info from the modal into local variables
        var name = document.getElementById("txtName").value;
        var email = document.getElementById("txtEmail").value;
        var gender = document.getElementById("txtSex").value;
        var beverage = document.getElementById("txtBeverage").value;
        var food = document.getElementById("txtFood").value;
        var clothing = document.getElementById("txtClothing").value;
        var time = document.getElementById("txtTimeOfDay").value;
        var social = document.getElementById("txtSocial").value;
        var transport = document.getElementById("txtTransport").value;
        var number = document.getElementById("txtNumber").value;
        var facial = document.getElementById("txtFacial").value;
        var dataString = name + ";" + email + ";" + gender + ";" + beverage + ";" + food + ";" + clothing + ";" + time + ";" + social + ";" + transport + ";" + number + ";" + facial;
        console.log(dataString);
        //delete current values in profile table
        if (app.db == null) {
            app.db = sqlitePlugin.openDatabase({
                name: app.appDatabaseName,
                iosDatabaseLocation: 'default'
            });
        }
        app.db.executeSql('DELETE FROM profile', []);
        //insert all the new info from modal into profile table
        app.db.transaction(function (tx) {
            //clear out the old records first
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['full_name', name], function () {}, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['email', email], function () {}, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['gender', gender], function () {}, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['beverage', beverage], function () {}, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['food', food], function () {}, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['clothing', clothing], function () {

            }, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['time', time], function () {

            }, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['social', social], function () {

            }, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['transport', transport], function () {

            }, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['number', number], function () {

            }, function (e) {
                console.log(e.message);
            });
            tx.executeSql('INSERT INTO profile(item_name, item_value) VALUES(?, ?)', ['facial', facial], function () {

            }, function (e) {
                console.log(e.message);
            });

        }, function (error) {

            console.log("failed the transaction adding the profile data: " + JSON.stringify(error));
        }, function () {
            console.log(test);
            //call fetchprofile when done
            app.fetchProfile();
        });

    },
    fetchProfile: function () {
        app.profile = {};
        console.log("fetchprofile");
        //fetch all the profile info from profile table
        if (app.db == null) {
            app.db = sqlitePlugin.openDatabase({
                name: app.appDatabaseName,
                iosDatabaseLocation: 'default'
            });
        }
        //update app.profile
        app.db.executeSql("SELECT item_name, item_value FROM profile ORDER BY item_id", [],
            function (results) {
                numRows = results.rows.length;
                console.log(numRows + " profile rows");
                app.profile = {};
                for (var i = 0; i < numRows; i++) {
                    app.profile[results.rows.item(i).item_name] = results.rows.item(i).item_value;
                }
                app.createQR();
                //update home page info based on app.profile
                document.getElementById("name").textContent = "Name: " + app.profile['full_name'];
                document.getElementById("email").textContent = "Email: " + app.profile['email'];
                document.getElementById("gender").textContent = "Gender pronoun: " + app.profile['gender'];
                document.getElementById("beverage").textContent = "Type of Beverage: " + app.profile['beverage'];
                document.getElementById("food").textContent = "Type of Food: " + app.profile['food'];
                document.getElementById("clothing").textContent = "Clothing: " + app.profile['clothing'];
                document.getElementById("time").textContent = "Time of Day: " + app.profile['time'];
                document.getElementById("social").textContent = "Social Media: " + app.profile['social'];
                document.getElementById("transport").textContent = "Mode of Transportation: " + app.profile['transport'];
                document.getElementById("number").textContent = "Favourite Number: " + app.profile['number'];
                document.getElementById("facial").textContent = "Facial expression: " + app.profile['facial'];
            },
            function (error) {
                console.log("fetchprofile " + error.message);
            });
            

    },
    createQR: function () {
        //build the string to display as QR Code from app.profile
        document.getElementById("qr").innerHTML = "";
        var str = "";
        for (prop in app.profile) {
            str += app.profile[prop] + ";";
        };
        console.log(str);
        //update the QR caode using new QRCode( ) method
        var qrcode = new QRCode(document.getElementById("qr"), {
            text: str,
            width: 300,
            height: 300,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

    },
    showWizard: function (ev) {
        ev.preventDefault();
        //call the modal init method
        app.modal.init();
    },
    fetchContacts: function () {
        if (app.db == null) {
            app.db = sqlitePlugin.openDatabase({
                name:app.appDatabaseName,
                iosDatabaseLocation: 'default'
            });
        }
        //select all the madlib_id, full_name form madlibs table
        app.db.executeSql('SELECT madlib_id, full_name FROM madlibs ORDER BY full_name', [], function (results) {
            var numContacts = results.rows.length;
            console.log(numContacts + " contacts found");
            var ul = document.getElementById("list");
            ul.innerHTML = "";
            if (numContacts == 0) {
                var li = document.createElement("li");
                li.textContent = "No contacts yet. Scan your Friends QR.";
                li.setAttribute("data-id", 0);
                ul.appendChild(li);
            } else {
                console.log(numContacts + " found");
                //loop through results and build the list for contacts page
                //add click event to each li to call app.navigate
                for (var i = 0; i < numContacts; i++) {
                    console.log(i);
                    var li = document.createElement("li");
                    li.className = "list-item contact";
                    li.textContent = results.rows.item(i).full_name;
                    console.log("add " + li.textContent);
                    li.setAttribute("data-id", results.rows.item(i).madlib_id);
                    li.setAttribute("data-href", "madlib");
                    li.addEventListener("click", app.navigate);
                    ul.appendChild(li);
                    //add <i class="fa fa-chevron-right"></i>
                    var icon = document.createElement("i");
                    icon.className = "fa fa-chevron-right";
                    li.appendChild(icon);
                }
            }
        }, function () {

        });

    },
    scan: function (ev) {
        ev.preventDefault();
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                console.log(result.format);
                console.log(result.cancelled);
                if (!result.cancelled) {
                    //extract the string from the QRCode
                    var strQR = result.text;
                    var partsQR = strQR.split(";");
                    var name = partsQR[0];
                    var email = partsQR[1];
                    var gender = partsQR[2];
                    var beverage = partsQR[3];
                    var food = partsQR[4];
                    var clothing = partsQR[5];
                    var time = partsQR[6];
                    var social = partsQR[7];
                    var transport = partsQR[8];
                    var number = partsQR[9];
                    var facial = partsQR[10];
                    var date = new Date();
                    var today = date.getDate() + " " + app.months[date.getMonth()];
                    var userrand1, userrand2;
                    if ((Math.round(Math.random())) == 0) {
                        userrand1 = app.profile.full_name;
                        gender1 = app.profile.gender;
                        userrand2 = name;
                        gender2 = gender;
                    } else {
                        userrand1 = name;
                        gender1 = gender;
                        userrand2 = app.profile.full_name;
                        gender2 = app.profile.gender;
                    }
                    var test = "N:" + name + ";E:" + email + ";G:" + gender + ";B:" + beverage + ";F:" + food + ";C:" + clothing + ";T:" + time + ";M:" + social + ";T:" + transport + ";N:" + number + ";F:" + facial;
                    console.log(test + "AND" + userrand1 + ";" + userrand2 + ";" + gender1 + ";" + gender2);

                    //build a madlib by randomly picking a value from app.profile OR data from QRCode
                    document.querySelector('#story [data-ref="user-a"]').textContent = app.profile.full_name;
                    document.querySelector('#story [data-ref="user-b"]').textContent = name;
                    document.querySelector('#story [data-ref="date"]').textContent = today;
                    document.querySelector('#story [data-ref="beverage-1"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.beverage : beverage;
                    document.querySelector('#story [data-ref="transport"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.transport : transport;
                    document.querySelector('#story [data-ref="user-rand-1-1"]').textContent = userrand1;
                    document.querySelector('#story [data-ref="gender-1"]').textContent = gender1;
                    document.querySelector('#story [data-ref="beverage-2"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.beverage : beverage;
                    document.querySelector('#story [data-ref="user-rand-2-1"]').textContent = userrand2;
                    document.querySelector('#story [data-ref="clothing"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.clothing : clothing;
                    document.querySelector('#story [data-ref="user-rand-2-2"]').textContent = userrand2;
                    document.querySelector('#story [data-ref="user-rand-1-2"]').textContent = userrand1;
                    document.querySelector('#story [data-ref="facial"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.facial : facial;
                    document.querySelector('#story [data-ref="social"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.social : social;
                    document.querySelector('#story [data-ref="time"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.time : time;
                    document.querySelector('#story [data-ref="number"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.number : number;
                    document.querySelector('#story [data-ref="food"]').textContent = ((Math.round(Math.random())) == 0) ? app.profile.food : food;

                    var madlib = document.getElementById("story").innerHTML;
                    console.log(madlib);
                    if (app.db == null) {
                        app.db = sqlitePlugin.openDatabase({
                            name: app.appDatabaseName,
                            iosDatabaseLocation: 'default'
                        });
                    }
                    //insert the new madlib into the madlibs table (creating a new contact)
                    app.db.executeSql("INSERT INTO madlibs(full_name, madlib_txt) VALUES(?, ?)", [name, madlib], function (res) {
                        //insert the new madlib into the madlibs table (creating a new contact)
                        console.log("madlib created and saved");
                        //new li will be displayed when contact page loads
                        document.getElementById("madlibLink").click();
                    }, function (error) {
                        console.log("Failed to save madlib " + error.message);
                    });

                } else {
                    alert("Oops Scan cancelled");
                }
            }
        );

    },
    loadStory: function (contact_id) {
        if (app.db == null) {
            app.db = sqlitePlugin.openDatabase({
                name: app.appDatabaseName,
                iosDatabaseLocation: 'default'
            });
        }
        //use the contact_id as the madlib_id from madlibs table
        app.db.executeSql('SELECT madlib_txt FROM madlibs WHERE madlib_id=?', [contact_id], function (results) {
            //select the madlib_txt and display as the new madlib
            var story = results.rows.item(0).madlib_txt;
            document.getElementById("story").innerHTML = story;
        }, function (error) {
            console.log(error.code + " " + error.message);
        });

    },
    popPop: function (ev) {
        //handle the back button
        ev.preventDefault();
        var hash = location.hash.replace("#", ""); //history.state.page;
        var pages = document.querySelectorAll("[data-role=page]");
        var tabs = document.querySelectorAll("#menu li");
        [].forEach.call(pages, function (p, index) {
            p.classList.remove("active");
            if (p.id == hash) {
                p.classList.add("active");
            }
        });
        [].forEach.call(tabs, function (item, index) {
            item.classList.remove("active-tab");
            if (item.querySelector("a").getAttribute("data-href") == hash) {
                item.classList.add("active-tab");
            }
        });
    }

};



var modal = {
    numSteps: 0,
    overlay: null,
    activeStep: 0,
    self: null,
    init: function () {
        console.log("clicked show modal button");
        //set up modal then show it
        modal.self = document.querySelector(".modal");
        modal.overlay = document.querySelector(".overlay");
        modal.numSteps = document.querySelectorAll(".modal-step").length;
        //set up button listeners
        modal.prepareSteps();
        modal.setActive(0);
        modal.show();
    },
    show: function () {
        modal.overlay.style.display = 'block';
        modal.self.style.display = 'block';
    },
    hide: function () {
        modal.self.style.display = 'none';
        modal.overlay.style.display = 'none';
        console.log("Hide called..");
    },
    saveInfo: function () {
        //this function will use AJAX or SQL statement to save data from the modal steps
        window.app.saveProfile();
        //when successfully complete, hide the modal
        //we could hide the modal and leave the overlay and show an animated spinner
        modal.hide();
       app.fetchProfile();
    },
    setActive: function (num) {
        modal.activeStep = num;
    [].forEach.call(document.querySelectorAll(".modal-step"), function (item, index) {
            //set active step
            if (index == num) {
                item.classList.add("active-step");
            } else {
                item.classList.remove("active-step");
            }
        });
    },
    prepareSteps: function () {
    [].forEach.call(document.querySelectorAll(".modal-step"), function (item, index) {
            //add listener for each button
            var btn = item.querySelector("button");
            btn.addEventListener("click", modal.nextStep);
		
			
			
            //set text on final button to save/complete/close/done/finish
            if (index == (modal.numSteps - 1)) {
                btn.textContent = "COMPLETE"
                 
            }
        });
    },
	
    nextStep: function (ev) {
        modal.activeStep++;
        if (modal.activeStep < modal.numSteps) {
            modal.setActive(modal.activeStep);
        } else {
            //we are done this is the final step
            console.log("last step");
            modal.saveInfo();
        }
    },
    reset: function () {
        //this could be a function to clear out any form fields in your modal
    }
}
app.initialize();