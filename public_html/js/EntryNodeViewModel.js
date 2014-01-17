function EntryNodeViewModel(entryNodeModel) {
	this.entryNodeModel=entryNodeModel; //js obj from json
	this.viewDomE=null; //until render is called for first time
	
	//attributes of this object
	this.visible=true;

	//self
	if(this.entryNodeModel.pid !== null)
		this.eT = new EntryNodeTextViewModel(this.entryNodeModel.body,this.entryNodeModel.pid);
	else
		this.eT = null;

	//children
	this.children = {};
	for(var key in this.entryNodeModel.children) {
		this.children[key]=new EntryNodeViewModel(this.entryNodeModel.children[key]);
	}

	// only for debugging
	this.killHTML = function(){
		if(this.eT!==null)
			this.eT.killHTML();
		for(var key in this.children) {	
			this.children[key].killHTML()
		}
	}

	// new EntryList(this.entryNodeModel['children'])

	//render must be called first so that viewDomE!==null
	this.show = function() {
		if(this.viewDomE === null){
			console.log("viewDomE is null")
			return;
		}
		if(this.getViewDomE().css('display')=='none'){
			numberOfIdeasVisible += 1;
		}
		this.getViewDomE().css("display","inherit");
		this.getViewDomE().visible=true;
	}

	//render must be called first so that viewDomE!==null
	this.hide = function() {
		if(this.viewDomE === null){
			console.log("viewDomE is null")
			return;
		}
		if(this.getViewDomE().css('display')!='none'){
			numberOfIdeasVisible -= 1;
		}
		this.getViewDomE().css("display","none");
		this.getViewDomE().visible=false;
	}
	this.getViewDomE = function(){ // #HACK
		return $('.entryNode[-idea-id="'+this.entryNodeModel.pid+'"]');
	}
	//render must be called first so that viewDomE!==null
	this.filter = function(query){
		if(this.getViewDomE() === null){ //ERROR
			console.log("viewDomE is null")
			return;
		}
		if(this.eT !== null){
			var isMatch=this.eT.filter(query); //returns true if matches. Boldifies its own text
			if(!isMatch)
				this.hide();
			else 
				this.show();
			updateNrOfIdeasVisible()
		}
		$.each(this.children,function() {this.filter(query)})
		//#TODO #future should we show parents of children who match?
	}


	//render current node, and also, all its children
	//for the root node, perhaps there needn't be self info?
	this.render = function() {
		//entryNodeBodyToHTML
		//entryNodeChildrenToHTML
		
		var entryNodeBody="";
		if(this.entryNodeModel.pid!==null) {
			numberOfIdeasVisible +=1;
			updateNrOfIdeasVisible()
	
			var table = "<table class='table'>" // <tr> <th>Post Body</th>  <th></th>Progress Bar<th>User</th> <th>Time</th> </tr>";    
			this.entryNodeModel;

			var time = new Date(this.entryNodeModel.time * 1000);

			//moved to UTIL var statusTable={0:"Not acknowledged",1:"Acknowledged",2:"In Progress", 3:"Done"};
			var progEntry=this.entryNodeModel.progress && this.entryNodeModel.progress != "null" ? this.entryNodeModel.progress + '% - ': "";

			status ="<td class='status'>" +'<div class="star">' +
			'<a class="star-off star-on" href="#" title="This is a favorite question (click again to undo)">&nbsp;&nbsp;&nbsp;</a>'+			
			'</div>' + '<div class="status-box"><a href="#" rel="popover" data-content="'+progEntry +this.entryNodeModel.metric+'" data-original-title="'+statusTable[this.entryNodeModel.status]+'"><div class="status sc'+this.entryNodeModel.status +'" >'+ '</div></a><div>' + "</td>";
			upvoter='<td class="votes" -idea-id="'+this.entryNodeModel.pid+'"><span class="vote"> </span><span class="votes" >'+this.entryNodeModel.upvotes+'</span></td>';



			//entryNodeBody="<div>"+table+"</div>";
			comments=""
			/*
			comments="<div class='showcomments'><a href='#' class='showcomments'>7+ Comments</a>";
			
			comments+='<div class="commentform"> \
					<div class="commentsinput" contenteditable="true" placeholder="" -idea-id="'+this.entryNodeModel.pid+'"></div> \
					<input class="btn" type="button" value="Comment"> \
				</div>';
			comments+='</div>';
			*/
			//entryNodeBody+=comments;
			table += '<tr>'+status + upvoter+'<td class="ideaTxt">' +"<div class='ideaTxtInner'></div>"+comments+"</td>" + 
		   	// '<td><div class="progressbar"></div></td>' +
		   	"<td class='timecol'><span class='uid'>" + (this.entryNodeModel.uid!="0" ? this.entryNodeModel.uid : "anon") + "</span>" + dateToString(time.getMonth(), time.getDate()) + ", " + timeToString(time.getHours(), time.getMinutes()) +
//		   	"<br><input class=\"LinkCreateType\" placeholder=\"Type a Connection\" />" +
			"</td></tr>";

		   	table+="</table>";

		   	entryNodeBody="<div>"+table+"</div>";

		   	entryNodeBody=$($.parseHTML(entryNodeBody));

			var eTView=this.eT.render();

			// there should only ever be one
			entryNodeBody.find("div.ideaTxtInner").append(eTView);
		}
		

		//render children
		//View means HTML
		var childrenListView=$($.parseHTML("<ul class='entrylist'></ul>"));
		for(var key in this.children) {
			var cNRendered=this.children[key].render();

			var entryNodeChildView=$($.parseHTML("<li></li>\n"));
			entryNodeChildView.append(cNRendered);

			childrenListView.append(entryNodeChildView);
		}

		this.viewDomE = $($.parseHTML("<ul class='entryNode' -idea-id='"+this.entryNodeModel.pid+"'>" + 
		"</ul>"));
		

		var eNBLi=$($.parseHTML("<li></li>"));
		eNBLi.append(entryNodeBody);

		var cLVLi=$($.parseHTML("<li></li>"));
		cLVLi.append(childrenListView);

		this.viewDomE.append(eNBLi);
		this.viewDomE.append(cLVLi);
		// if(this.eT !==null)	
		// 	this.eT.killHTML();
		return this.viewDomE;
	}
}